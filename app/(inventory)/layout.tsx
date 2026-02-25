import { HeaderBlue } from "@/components/HeaderBlue";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="pt-14 h-screen">
      <HeaderBlue />
    
      <div className="w-full h-full overflow-y-auto overflow-x-hidden py-6 px-6">
      {children}
      </div>
    </div>
  );
}