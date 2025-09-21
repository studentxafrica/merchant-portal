import { Merchant } from "@/types/user";
import React, { useEffect, useRef, useState } from "react";

interface HelpCenterProps {
  merchant: Merchant | null;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ merchant }) => {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Initialize Tawk.to script
    // @ts-ignore
    window.Tawk_API = window.Tawk_API || {};
    // @ts-ignore
    window.Tawk_LoadStart = new Date();
    // @ts-ignore
    window.Tawk_API.visitor = {
      name: merchant?.name || '',
      email: merchant?.email || '',
    };

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = 'https://embed.tawk.to/6839a99736f44c191214215a/1isgjsuvn';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    const s0 = document.getElementsByTagName("script")[0];
    if (s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    }

    return () => {
      // Cleanup
      if (s1.parentNode) {
        s1.parentNode.removeChild(s1);
      }
    };
  }, [merchant]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">Loading Help Center...</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        id="article-frame"
        className={`w-full h-full ${isLoading ? 'invisible' : 'visible'}`}
        src="https://studentx.tawk.help"
        title="Help Center"
        onLoad={handleIframeLoad}
      />
    </div>
  );
};

export default HelpCenter;