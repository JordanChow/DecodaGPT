import { MessageType } from "@/utils/types";
import axios from "axios";

const customAxios = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const getThread = (threadId: string) => {
  const resp = customAxios({
    method: "get",
    url: `/threads/${threadId}`,
  })
    .then((res) => {
      return res;
    })
    .catch((e) => {
      console.log(e.toJSON());
      return e;
    });
  return resp;
};

export const getThreads = () => {
  const resp = customAxios({
    method: "get",
    url: "/threads",
  })
    .then((res) => {
      return res;
    })
    .catch((e) => {
      console.log(e.toJSON());
      return e;
    });
  return resp;
};

export const createThreadAndSendMessage = (message: MessageType) => {
  const resp = customAxios({
    method: "post",
    url: "/threads",
    data: {
      role: message.role,
      content: message.content,
    },
  })
    .then((res) => res)
    .catch((e) => {
      console.log(e.toJSON());
      return e;
    });
  return resp;
};

// Pre existing thread
export const sendMessage = (threadId: string, message: MessageType) => {
  const resp = customAxios({
    method: "post",
    url: `/threads/${threadId}/messages`,
    data: {
      role: message.role,
      content: message.content,
    },
  })
    .then((res) => res)
    .catch((e) => {
      console.log(e.toJSON());
      return e;
    });
  return resp;
};

// Get list of appointments from json file
export const getAppointments = () => {
  const resp = customAxios({
    method: "get",
    url: "/appointments",
  })
    .then((res) => res)
    .catch((e) => {
      console.log(e.toJSON());
      return e;
    });
  return resp;
};
