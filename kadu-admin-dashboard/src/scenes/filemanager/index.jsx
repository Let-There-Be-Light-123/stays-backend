import React, { useRef, useState } from 'react';
import { FileManagerComponent } from '@syncfusion/ej2-react-filemanager';

const FileManagerPopup = ({ isOpen, onClose }) => {
  const fileManagerRef = useRef(null);
  const [visible, setVisible] = useState(isOpen);

  const onPopupClose = () => {
    setVisible(false);
    onClose();
  };

  const onButtonClick = () => {
    setVisible(true);
  };

  return (
    <div>
      <button onClick={onButtonClick}>Open File Manager</button>
      {visible && (
        <FileManagerComponent
          ref={fileManagerRef}
          rootAliasName="Files"
          ajaxSettings={{
            url: 'your-api-endpoint-for-file-manager', // Replace with your API endpoint
          }}
          view="Details"
          popupSettings={{
            height: 500,
            width: 600,
            title: 'File Manager',
            close: onPopupClose,
          }}
        />
      )}
    </div>
  );
};

export default FileManagerPopup;
