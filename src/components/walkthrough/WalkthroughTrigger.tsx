import { HelpCircle } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useWalkthroughStore } from "@/stores/walkthroughStore";
import AppWalkthrough from "@/components/walkthrough/AppWalkthrough";

const WalkthroughTrigger = () => {
  const { 
    isWalkthroughOpen, 
    openWalkthrough, 
    closeWalkthrough, 
    setWalkthroughComplete 
  } = useWalkthroughStore();

  return (
    <>
      <SpiritualButton 
        variant="ghost" 
        size="icon" 
        onClick={openWalkthrough}
        title="App Guide"
      >
        <HelpCircle className="w-5 h-5" />
      </SpiritualButton>

      <AppWalkthrough 
        isOpen={isWalkthroughOpen}
        onClose={closeWalkthrough}
        onComplete={setWalkthroughComplete}
      />
    </>
  );
};

export default WalkthroughTrigger;
