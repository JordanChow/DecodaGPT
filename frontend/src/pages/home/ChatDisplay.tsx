import {
  createThreadAndSendMessage,
  getThread,
  sendMessage,
} from "@/api/manageThreads";
import MessageSegment from "@/components/MessageSegment";
import { MessageType, Role } from "@/utils/types";
import logo from "@/logo.svg";
import { ArrowUpIcon } from "@chakra-ui/icons";
import {
  Box,
  Container,
  Flex,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ChatDisplay() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [userText, setUserText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const threadId = location.pathname.split("/")[1];

  // Smooth scroll downwards when messages overflow
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const getThreadData = async () => {
      const newMessages: MessageType[] = [];
      const res = await getThread(threadId);

      // Retrieve old messages
      if (res.status === 200 && res.data) {
        res.data.messages.forEach((message: any) => {
          const newMessage: MessageType = {
            role: message.role,
            content: message.content[0].text.value,
            thread_id: threadId,
          };
          newMessages.push(newMessage);
        });
        setMessages(newMessages);
        setIsEmpty(newMessages.length === 0);
      }
    };

    // Retrieve messages for an old thread
    if (threadId) {
      setIsEmpty(messages.length === 0);
      getThreadData();
    }
    // Reset thread empty
    else {
      setIsEmpty(true);
      setMessages([]);
    }
  }, [threadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) {
      // Prevent query param in url
      setIsLoading(true);
      e.preventDefault();

      const userMessage: MessageType = {
        role: Role.USER.toString(),
        content: userText,
      };
      setUserText("");

      // Push initial user message
      const updatedMessages = [...messages];
      updatedMessages.push(userMessage);

      // pre existing chat - update messages with assistant reply
      if (threadId) {
        userMessage.thread_id = threadId;
        const res = await sendMessage(threadId, userMessage);

        if (res.status === 200 && res.data) {
          updatedMessages.push(res.data);
          setMessages(updatedMessages);
        }
      }
      // new chat - initialize thread and update messages with assistant reply
      else {
        const res = await createThreadAndSendMessage(userMessage);

        if (res.status === 200 && res.data) {
          const responseData: MessageType = res.data;
          updatedMessages.push(responseData);

          setMessages(updatedMessages);
          navigate(responseData.thread_id || "");
        } else {
          // Failed response, reset and go back home to new chat
          navigate("/");
        }
      }
    }
    setIsLoading(false);
  };

  return (
    <VStack className="h-screen" pt={"5"}>
      <Container className="flex-1 w-full" maxW="3xl">
        <Flex
          flexShrink={0}
          overflowY={"auto"}
          maxHeight={"39rem"}
          direction="column"
          gap="2"
        >
          {isEmpty ? (
            <Flex
              justifyContent={"center"}
              alignItems={"center"}
              gap="2"
              h="100vh"
            >
              <Image src={logo} alt="DecodaGPT Logo" />
              <Text fontSize="3xl">How can I help you today?</Text>
            </Flex>
          ) : (
            <>
              {messages.map((message, idx) => (
                <MessageSegment
                  key={idx}
                  role={message.role.toString()}
                  content={message.content}
                />
              ))}
              <div ref={messagesEndRef}></div>
            </>
          )}
        </Flex>
      </Container>
      <Box className="justify-end w-3/4 flex-2 mb-8">
        <form onSubmit={handleSubmit}>
          <InputGroup size="lg">
            {isLoading && <Spinner mt="2" mr="2" />}
            <Input
              type="text"
              placeholder="Message DecodaGPT..."
              onChange={(e) => setUserText(e.currentTarget.value)}
              value={userText}
              disabled={isLoading}
            />
            <InputRightElement width="3rem">
              <IconButton
                colorScheme="blue"
                aria-label="Submit message"
                size="sm"
                icon={<ArrowUpIcon color={"white"} />}
                onClick={handleSubmit}
              />
            </InputRightElement>
          </InputGroup>
          <Text fontSize={"xs"} textAlign={"center"} mt="2">
            Please be specific when specifying the date for an appointment.
          </Text>
        </form>
      </Box>
    </VStack>
  );
}
