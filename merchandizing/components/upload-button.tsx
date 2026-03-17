import { Upload } from "lucide-react";
import { useCSVReader } from "react-papaparse";

import { Button } from "@/components/ui/button";

type Props = {
  onUpload: (results: { data: unknown[] }) => void;
};

export const UploadButton = ({ onUpload }: Props) => {
  const { CSVReader } = useCSVReader();
  // const { shouldBlock, triggerPaywall } = usePaywall();

  // if (true) {
  // // if (shouldBlock) {
  //   return (
  //     <Button
  //       size="sm"
  //       className="w-full lg:w-auto"
  //       // onClick={triggerPaywall}
  //     >
  //       <Upload className="size-4 mr-2" />
  //       Import
  //     </Button>
  //   );
  // }

  return (
    <CSVReader onUploadAccepted={onUpload}>
      {({ getRootProps }: { getRootProps: () => React.HTMLAttributes<HTMLButtonElement> }) => (
        <Button
          size="sm"
          className="w-full lg:w-auto"
          {...getRootProps()}
        >
          <Upload className="size-4 mr-2" />
          Import
        </Button>
      )}
    </CSVReader>
  );
};
