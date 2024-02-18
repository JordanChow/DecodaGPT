import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar as FlowBiteSideBar } from "flowbite-react";
import { Button } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { getThreads } from "@/api/manageThreads";
import { ThreadType } from "@/utils/types";
import logo from "@/logo.svg";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [threads, setThreads] = useState<ThreadType[]>([]);
  const threadsList: ThreadType[] = [];

  useEffect(() => {
    const getThreadsData = async () => {
      const res = await getThreads();
      if (res.status === 200 && res.data) {
        res.data.forEach((thread: ThreadType) => {
          const existingThreadIds = threadsList.map((t) => t.id);
          if (!existingThreadIds.includes(thread.id)) {
            if (thread.messages.length > 0) {
              thread.name = `${
                thread.name
              } - ${thread.messages[0]?.content[0].text.value.slice(0, 16)}`;
            }
            threadsList.push(thread);
          }
        });
        threadsList.sort(
          (a: ThreadType, b: ThreadType) => b.created_at - a.created_at
        );
        setThreads(threadsList);
      }
    };

    getThreadsData();
  }, [location.pathname]);

  return (
    <FlowBiteSideBar className="h-lvh">
      <div className="sticky top-0 bg=[#f9fafb]">
        <FlowBiteSideBar.Logo href="" img={logo} imgAlt="DecodaGPT logo">
          DecodaGPT
        </FlowBiteSideBar.Logo>
        <Button
          colorScheme={"green"}
          rightIcon={<EditIcon />}
          className="w-full"
          variant="outline"
          mb="6px"
          onClick={() => navigate("/")}
        >
          New Chat
        </Button>
      </div>
      <div>
        {threads.length > 0 && (
          <FlowBiteSideBar.Items className="overflow-y-auto">
            <FlowBiteSideBar.ItemGroup>
              {threads.map((thread, idx) => (
                <FlowBiteSideBar.Item
                  href={thread.id}
                  active={location.pathname.includes(thread.id)}
                  key={idx}
                >
                  {thread.name}
                </FlowBiteSideBar.Item>
              ))}
            </FlowBiteSideBar.ItemGroup>
          </FlowBiteSideBar.Items>
        )}
      </div>
    </FlowBiteSideBar>
  );
}
