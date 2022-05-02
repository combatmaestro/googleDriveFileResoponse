import { useEffect } from "react";
import useDrivePicker from "react-google-drive-picker";

function GoogleDrive() {
  const [openPicker, data, authResponse] = useDrivePicker();
  // const customViewsArray = [new google.picker.DocsView()]; // custom view
  const handleOpenPicker = () => {
    openPicker({
      clientId:"971056933997-0s5ulnl2aps6ci6lpluvh9p85207p44j.apps.googleusercontent.com",
      developerKey:"AIzaSyAcM2nF8UsYJensQaQIZSiIe4etx94DOdk",
      viewId:"DOCS",
      //token:"##youraccesstoken##", // pass oauth token in case you already have one
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      // customViews: customViewsArray, // custom view
    });
  };

  useEffect(() => {
    // do anything with the selected/uploaded files
    if (data) {
      data.docs.map((i) => console.log(i));
    }
  }, [data]);

  return (
    <div>
      <button onClick={() => handleOpenPicker()}>Open Picker</button>
    </div>
  );
}

export default GoogleDrive;