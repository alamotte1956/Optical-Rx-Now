import { useRef } from "react";

const LOGO_URL = "/logo-transparent.png";

export const BrandLogo = ({ onLongPress }) => {
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startLongPress = () => {
    if (!onLongPress) {
      return;
    }

    clearTimer();
    timerRef.current = window.setTimeout(() => {
      onLongPress();
      clearTimer();
    }, 3000);
  };

  return (
    <button
      className="vault-brand-lockup cursor-default bg-transparent p-0 text-left"
      data-testid="brand-logo-lockup"
      onContextMenu={(event) => event.preventDefault()}
      onPointerCancel={clearTimer}
      onPointerDown={startLongPress}
      onPointerLeave={clearTimer}
      onPointerUp={clearTimer}
      type="button"
    >
      <img
        alt="My Optical Wallet logo"
        className="vault-brand-image"
        data-testid="brand-logo-image"
        loading="eager"
        src={LOGO_URL}
      />
    </button>
  );
};
