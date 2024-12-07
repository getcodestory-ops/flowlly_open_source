import React, { useState, useEffect } from "react";
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
import { getProjects } from "../api/projectApi";
import { ProjectEntity } from "../types/project";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_DROPDOWN_HEIGHT = SCREEN_HEIGHT * 0.4;

export default function ProjectSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const setActiveProject = useStore((state) => state.setActiveProject);

  useEffect(() => {
    if (!session) return;

    const loadProjects = async () => {
      try {
        const fetchedProjects = await getProjects(session);
        setProjects(fetchedProjects || []);
      } catch (error) {
        console.error("Error loading projects:", error);
        setProjects([]);
      }
    };

    loadProjects();
  }, [session]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.activeText}>
          {activeProject?.name || "Select Project"}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContainer}>
          <ScrollView
            style={[styles.projectList, { maxHeight: MAX_DROPDOWN_HEIGHT }]}
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            {projects.map((project) => (
              <TouchableOpacity
                key={project.project_id}
                style={[
                  styles.projectItem,
                  activeProject?.project_id === project.project_id &&
                    styles.activeProjectItem,
                ]}
                onPress={() => {
                  setActiveProject(project);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.projectName,
                    activeProject?.project_id === project.project_id &&
                      styles.activeProjectName,
                  ]}
                  numberOfLines={1}
                >
                  {project.name}
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
    zIndex: 3,
    elevation: 3,
    marginBottom: 10,
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
    zIndex: 3,
  },
  projectList: {
    width: "100%",
  },
  projectItem: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  activeProjectItem: {
    backgroundColor: "#007AFF",
  },
  projectName: {
    fontSize: 16,
    color: "#333",
  },
  activeProjectName: {
    color: "#fff",
  },
});
