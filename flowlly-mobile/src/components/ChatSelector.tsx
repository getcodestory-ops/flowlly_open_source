import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Button } from "react-native-elements";
import { useStore } from "../utils/store";
import { createNewChatSession } from "../api/chatApi";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_DROPDOWN_HEIGHT = SCREEN_HEIGHT * 0.4;

export default function ChatSelector() {
  const activeChatEntity = useStore((state) => state.activeChatEntity);
  const setActiveChatEntity = useStore((state) => state.setActiveChatEntity);
  const chatEntities = useStore((state) => state.chatEntities);
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const [isOpen, setIsOpen] = useState(false);

  const handleNewChat = async () => {
    if (!session || !activeProject) return;

    try {
      const newChat = await createNewChatSession(
        session,
        "New Chat",
        activeProject.project_id
      );
      setActiveChatEntity(newChat);
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.activeText}>
          {activeChatEntity?.chat_name || "Select Chat"}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContainer}>
          <Button
            title="New Chat"
            type="outline"
            onPress={handleNewChat}
            containerStyle={styles.newChatButton}
          />
          <ScrollView
            style={[styles.chatList, { maxHeight: MAX_DROPDOWN_HEIGHT }]}
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            {chatEntities.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={[
                  styles.chatItem,
                  activeChatEntity?.id === chat.id && styles.activeChatItem,
                ]}
                onPress={() => {
                  setActiveChatEntity(chat);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.chatName,
                    activeChatEntity?.id === chat.id && styles.activeChatName,
                  ]}
                  numberOfLines={1}
                >
                  {chat.chat_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    zIndex: 2,
    elevation: 2,
  },
  selector: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    marginBottom: 5,
    minHeight: 48,
    justifyContent: "center",
  },
  activeText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2,
  },
  newChatButton: {
    margin: 10,
  },
  chatList: {
    width: "100%",
  },
  chatItem: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  activeChatItem: {
    backgroundColor: "#007AFF",
  },
  chatName: {
    fontSize: 16,
    color: "#333",
  },
  activeChatName: {
    color: "#fff",
  },
});
