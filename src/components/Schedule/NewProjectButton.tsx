import React from "react";
// import { Button } from "@/components/ui/button";
// import { FiPlus } from "react-icons/fi";
// import AddNewProjectModal from "./XXXAddNewProjectModal";
import { AlertDialogDemo } from "./AddNewProjectModal";

const CreateNewProjectButton = () => {
  // const [isOpen, setIsOpen] = useState(false);
  // const onClose = () => setIsOpen(false);
  // const onOpen = () => setIsOpen(true);

  return (
    <div className="flex items-center">
      {/* <Button onClick={onOpen}>
        <FiPlus className="mr-2" /> Add New Project
      </Button> */}
      {/* <AddNewProjectModal isOpen={isOpen} onClose={onClose} /> */}
      <AlertDialogDemo />
    </div>
  );
};

export default CreateNewProjectButton;
