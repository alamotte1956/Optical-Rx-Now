import { StorageRecovery } from './storageRecovery';
import { EncryptionRecovery } from '../services/encryptionRecovery';
import { getErrorLogs } from './errorHandler';

interface HealthCheckResult {
  overall: 'healthy' | 'warning' | 'critical';
  checks: {
    storage: HealthStatus;
    encryption: HealthStatus;
    errorRate: HealthStatus;
  };
  timestamp: string;
  recommendations: string[];
}

interface HealthStatus {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  issues?: string[];
}

/**
 * Health Check System
 * Monitors and reports on system health
 */
export class HealthCheck {
  /**
   * Run comprehensive health check
   */
  static async runHealthCheck(): Promise<HealthCheckResult> {
    console.log('[Health Check] Starting system health check...');

    const checks = {
      storage: await this.checkStorage(),
      encryption: await this.checkEncryption(),
      errorRate: await this.checkErrorRate(),
    };

    const recommendations = this.generateRecommendations(checks);
    const overall = this.determineOverallHealth(checks);

    const result: HealthCheckResult = {
      overall,
      checks,
      timestamp: new Date().toISOString(),
      recommendations,
    };

    console.log('[Health Check] Health check complete:', result.overall);
    
    return result;
  }

  /**
   * Check storage health
   */
  private static async checkStorage(): Promise<HealthStatus> {
    try {
      const health = await StorageRecovery.checkHealth();
      
      if (health.healthy) {
        return {
          status: 'pass',
          message: 'Storage is healthy',
        };
      }

      return {
        status: health.issues.length > 2 ? 'fail' : 'warn',
        message: `Storage has ${health.issues.length} issue(s)`,
        issues: health.issues,
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Storage check failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Check encryption health
   */
  private static async checkEncryption(): Promise<HealthStatus> {
    try {
      const health = await EncryptionRecovery.verifyEncryptionHealth();
      
      if (health.healthy) {
        return {
          status: 'pass',
          message: 'Encryption system is healthy',
        };
      }

      return {
        status: health.issues.length > 2 ? 'fail' : 'warn',
        message: `Encryption has ${health.issues.length} issue(s)`,
        issues: health.issues,
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Encryption check failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Check error rate
   */
  private static async checkErrorRate(): Promise<HealthStatus> {
    try {
      const logs = getErrorLogs();
      const recentErrors = logs.filter(log => {
        const age = Date.now() - new Date(log.timestamp).getTime();
        return age < 3600000; // Last hour
      });

      const fatalErrors = recentErrors.filter(log => log.fatal);

      if (fatalErrors.length > 0) {
        return {
          status: 'fail',
          message: `${fatalErrors.length} fatal error(s) in the last hour`,
        };
      }

      if (recentErrors.length > 10) {
        return {
          status: 'warn',
          message: `${recentErrors.length} errors in the last hour`,
        };
      }

      return {
        status: 'pass',
        message: 'Error rate is normal',
      };
    } catch (error) {
      return {
        status: 'warn',
        message: `Error rate check failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Determine overall health
   */
  private static determineOverallHealth(checks: HealthCheckResult['checks']): 'healthy' | 'warning' | 'critical' {
    const statuses = Object.values(checks).map(check => check.status);

    if (statuses.some(s => s === 'fail')) {
      return 'critical';
    }

    if (statuses.some(s => s === 'warn')) {
      return 'warning';
    }

    return 'healthy';
  }

  /**
   * Generate recommendations
   */
  private static generateRecommendations(checks: HealthCheckResult['checks']): string[] {
    const recommendations: string[] = [];

    if (checks.storage.status === 'fail') {
      recommendations.push('Storage system requires immediate attention');
      recommendations.push('Consider clearing app cache or reinstalling');
    } else if (checks.storage.status === 'warn') {
      recommendations.push('Monitor storage health closely');
    }

    if (checks.encryption.status === 'fail') {
      recommendations.push('Encryption system needs recovery');
      recommendations.push('Contact support if issues persist');
    } else if (checks.encryption.status === 'warn') {
      recommendations.push('Create encryption key backup');
    }

    if (checks.errorRate.status === 'fail') {
      recommendations.push('High error rate detected');
      recommendations.push('Check error logs for patterns');
    } else if (checks.errorRate.status === 'warn') {
      recommendations.push('Monitor error logs');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is operating normally');
    }

    return recommendations;
  }

  /**
   * Auto-repair issues where possible
   */
  static async autoRepair(): Promise<{
    repaired: string[];
    failed: string[];
  }> {
    const repaired: string[] = [];
    const failed: string[] = [];

    try {
      // Attempt encryption key backup
      await EncryptionRecovery.backupEncryptionKey();
      repaired.push('Created encryption key backup');
    } catch (error) {
      failed.push(`Encryption backup failed: ${(error as Error).message}`);
    }

    try {
      // Run storage health check and auto-fix if possible
      const health = await StorageRecovery.checkHealth();
      if (health.healthy) {
        repaired.push('Storage system verified');
      }
    } catch (error) {
      failed.push(`Storage verification failed: ${(error as Error).message}`);
    }

    return { repaired, failed };
  }
}
