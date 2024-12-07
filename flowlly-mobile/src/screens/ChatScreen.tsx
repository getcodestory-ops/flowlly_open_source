import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import { Input, Button, Icon } from "react-native-elements";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "../utils/store";
import {
  getChatHistory,
  sendChatMessage,
  getChatSessions,
} from "../api/chatApi";
import { getProjects } from "../api/projectApi";
import { ChatMessage } from "../types/project";
import ChatSelector from "../components/ChatSelector";
import ProjectSelector from "../components/ProjectSelector";
import StreamChat from "../components/StreamChat";
import VoiceButton from "../components/VoiceButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 350);

export default function ChatScreen() {
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const panelAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const activeChatEntity = useStore((state) => state.activeChatEntity);
  const setActiveProject = useStore((state) => state.setActiveProject);
  const setChatEntities = useStore((state) => state.setChatEntities);
  const messages = useStore((state) => state.messages);
  const setMessages = useStore((state) => state.setMessages);

  const togglePanel = () => {
    const toValue = isPanelOpen ? 0 : 1;
    Animated.spring(panelAnim, {
      toValue,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
    setIsPanelOpen(!isPanelOpen);
  };

  const toggleMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (isListening) {
      setIsListening(false);
    }
  };

  const handleVoicePress = () => {
    setIsListening(!isListening);
    // TODO: Implement actual voice recognition
  };

  useEffect(() => {
    if (!session) return;

    const loadProjects = async () => {
      try {
        const projects = await getProjects(session);
        if (projects.length > 0) {
          setActiveProject(projects[0]);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    };

    loadProjects();
  }, [session, setActiveProject]);

  useEffect(() => {
    if (!session || !activeProject) return;

    const loadChatSessions = async () => {
      try {
        const chats = await getChatSessions(session, activeProject.project_id);
        setChatEntities(chats);
      } catch (error) {
        console.error("Error loading chat sessions:", error);
      }
    };

    loadChatSessions();
  }, [session, activeProject, setChatEntities]);

  useEffect(() => {
    if (!session || !activeChatEntity) return;

    const loadChatHistory = async () => {
      try {
        const history = await getChatHistory(session, activeChatEntity.id);
        setMessages(history);
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, [session, activeChatEntity, setMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session || !activeChatEntity || !activeProject)
      return;

    try {
      setLoading(true);
      const response = await sendChatMessage(
        session,
        newMessage,
        activeChatEntity.id,
        activeProject.project_id
      );
      setCurrentTaskId(response.agent_response);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user" ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender !== "user" && styles.receivedMessageText,
        ]}
      >
        {item.message.content}
      </Text>
      <Text
        style={[
          styles.timestamp,
          item.sender !== "user" && styles.receivedTimestamp,
        ]}
      >
        {new Date(item.created_at).toLocaleTimeString()}
      </Text>
    </View>
  );

  const renderVoiceMode = () => (
    <View style={styles.voiceOverlay}>
      <LinearGradient
        colors={["#9C27B0", "#673AB7", "#3F51B5"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <TouchableOpacity
        style={[styles.modeToggle, { backgroundColor: "transparent" }]}
        onPress={toggleMode}
      >
        <Icon name="keyboard" type="material" color="#fff" size={24} />
      </TouchableOpacity>
      <VoiceButton isListening={isListening} onPress={handleVoicePress} />
    </View>
  );

  const renderMainContent = () => {
    if (!activeProject) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.centerText}>
            Select a project to start chatting
          </Text>
        </View>
      );
    }

    if (!activeChatEntity) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.centerText}>
            Create or select a chat to start messaging
          </Text>
        </View>
      );
    }

    if (isVoiceMode) {
      return renderVoiceMode();
    }

    return (
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => `${item.created_at}-${index}`}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {currentTaskId && session && (
          <StreamChat
            streamingKey={currentTaskId}
            authToken={session.access_token}
          />
        )}

        <View style={styles.inputContainer}>
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChangeText={setNewMessage}
            containerStyle={styles.textInput}
            inputContainerStyle={styles.inputField}
            disabled={loading}
          />
          <Button
            title="Send"
            onPress={handleSendMessage}
            loading={loading}
            disabled={!newMessage.trim() || loading}
            containerStyle={styles.sendButton}
          />
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Side Panel - Always render but conditionally show */}
      <Animated.View
        style={[
          styles.sidePanel,
          {
            transform: [
              {
                translateX: panelAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-PANEL_WIDTH, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.selectors}>
          <ProjectSelector />
          {activeProject && <ChatSelector />}
        </View>
      </Animated.View>

      {/* Panel Toggle Button - Always visible */}
      <TouchableOpacity style={styles.toggleButton} onPress={togglePanel}>
        <Icon
          name={isPanelOpen ? "chevron-left" : "menu"}
          type="material"
          color="#007AFF"
          size={28}
        />
      </TouchableOpacity>

      {/* Mode Toggle Button - Only show when chat is active */}
      {activeProject && activeChatEntity && !isVoiceMode && (
        <TouchableOpacity
          style={[styles.modeToggle, { backgroundColor: "#fff" }]}
          onPress={toggleMode}
        >
          <Icon name="mic" type="material" color="#007AFF" size={24} />
        </TouchableOpacity>
      )}

      {/* Overlay when panel is open */}
      {isPanelOpen && (
        <Pressable style={styles.overlay} onPress={togglePanel} />
      )}

      {/* Main Content Area */}
      {renderMainContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  sidePanel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: "#fff",
    zIndex: 2,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  toggleButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 3,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modeToggle: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 3,
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectors: {
    padding: 20,
    paddingTop: 60,
  },
  chatContainer: {
    flex: 1,
    marginTop: 60,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  messagesList: {
    padding: 10,
  },
  messageContainer: {
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: "80%",
    padding: 10,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  receivedMessageText: {
    color: "#000",
  },
  timestamp: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 4,
  },
  receivedTimestamp: {
    color: "rgba(0, 0, 0, 0.5)",
  },
  voiceOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    marginRight: 10,
  },
  inputField: {
    borderBottomWidth: 0,
  },
  sendButton: {
    width: 70,
  },
});
