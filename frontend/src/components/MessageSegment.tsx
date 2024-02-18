import { Flex, Tag, Text } from "@chakra-ui/react";
import { Role } from "@/utils/types";

export default function MessageSegment(props: {
  role: string;
  content: string;
}) {
  const { role, content } = props;
  const isUser = role === Role.USER.toString();

  return (
    <Flex flexDirection={"column"}>
      <Tag
        colorScheme={isUser ? "green" : "blue"}
        alignSelf={"flex-start"}
        mb={1}
      >
        {isUser ? "You" : "DecodaGPT"}
      </Tag>
      <Text>{content}</Text>
    </Flex>
  );
}
