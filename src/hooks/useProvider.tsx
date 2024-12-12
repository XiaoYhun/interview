import { useEffect, useState } from "react";
import { getProvider } from "../libs";
import useEnvironment, { ENVIRONMENT } from "./useEnvironment";
import { useAccount } from "wagmi";

export default function useProvider() {
  const [provider, setProvider] = useState<any>();
  const { environment } = useEnvironment();
  const { connector } = useAccount();

  useEffect(() => {
    if (environment === ENVIRONMENT.LOCAL) {
      const p = getProvider();
      setProvider(p);
    } else {
      if (connector) {
        connector.getProvider().then((p) => {
          setProvider(p);
        });
      }
    }
  }, [environment]);

  return provider;
}
