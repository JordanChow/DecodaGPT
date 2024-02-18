import Sidebar from "@/components/Sidebar";
import ChatDisplay from "./ChatDisplay";

export default function Home() {
  return (
    <div className="flex w-screen flex-row">
      <div className="basis-1/5">
        <Sidebar />
      </div>
      <div className="basis-4/5">
        <ChatDisplay />
      </div>
    </div>
  );
}
