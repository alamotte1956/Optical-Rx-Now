import { useRouter } from 'next/router';

const FamilyTab = () => {
  const router = useRouter();

  const handleHomeButtonClick = () => {
    router.push('/');
  };

  return (
    <div>
      <button onClick={handleHomeButtonClick}>Home</button>
    </div>
  );
};

export default FamilyTab;