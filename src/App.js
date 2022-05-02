import React from "react";
import loadScript from "load-script";

const GOOGLE_SDK_URL = "https://apis.google.com/js/api.js";

let scriptLoadingStarted = false;

export default class GoogleChooser extends React.Component {
  

  onChange = () => {};
  // onAuthenticate = (oauthToken) =>{
  //   console.log(oauthToken);
  //   return true;
  // }
  onAuthenticate = () => {};
  onAuthFailed = () => {};

  

  constructor(props) {
    super(props);

    this.state = {
      scope: ["https://www.googleapis.com/auth/drive.file"],
      viewId: "DOCS",
      authImmediate: false,
      multiselect: false,
      navHidden: false,
      disabled: false,
      driveFileDownloadUrl: "",
      clientId:
        "971056933997-0s5ulnl2aps6ci6lpluvh9p85207p44j.apps.googleusercontent.com",
      developerKey: "AIzaSyArLYkpq5CKIUOQEIuh5JWwQKM1pqlJfdI",
    };
    this.onApiLoad = this.onApiLoad.bind(this);
    this.onChoose = this.onChoose.bind(this);
  }

  componentDidMount() {
    if (this.isGoogleReady()) {
      // google api is already exists
      // init immediately
      this.onApiLoad();
    } else if (!scriptLoadingStarted) {
      // load google api and the init
      scriptLoadingStarted = true;
      loadScript(GOOGLE_SDK_URL, this.onApiLoad);
    } else {
      // is loading
    }
  }

  isGoogleReady() {
    return !!window.gapi;
  }

  isGoogleAuthReady() {
    return !!window.gapi.auth;
  }

  isGooglePickerReady() {
    return !!window.google.picker;
  }

  onApiLoad() {
    window.gapi.load("auth");
    window.gapi.load("picker");
  }

  doAuth(callback) {
    window.gapi.auth.authorize(
      {
        client_id: this.state.clientId,
        scope: this.state.scope,
        immediate: this.state.authImmediate,
      },
      callback
    );
  }

  onChoose() {
    if (
      !this.isGoogleReady() ||
      !this.isGoogleAuthReady() ||
      !this.isGooglePickerReady() ||
      this.props.disabled
    ) {
      return null;
    }

    const token = window.gapi.auth.getToken();
    const oauthToken = token && token.access_token;

    if (oauthToken) {
      this.createPicker(oauthToken);
    } else {
      this.doAuth((response) => {
        if (response.access_token) {
          this.createPicker(response.access_token);
        } else {
          this.onAuthFailed(response);
        }
      });
    }
  }
  newcreatePicker(google, oauthToken) {
    const googleViewId = google.picker.ViewId.DOCS;
    const docsView = new google.picker.DocsView(googleViewId)
      .setIncludeFolders(true)
      .setMimeTypes("application/vnd.google-apps.folder,application/pdf")
      .setSelectFolderEnabled(true);

    const picker = new window.google.picker.PickerBuilder()
      .addView(docsView)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(this.state.developerKey)
      .setCallback((files) => {
        // console.log(files.docs);
        console.log("Custom picker is ready!");
        var myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${oauthToken}`);

        var requestOptions = {
          headers: myHeaders,
        };

        fetch(
          `https://www.googleapis.com/drive/v2/files/${files.docs[0].id}?key=${this.state.developerKey}`,
          // `https://www.googleapis.com/drive/v3/files/${files.docs[0].id}/export?mimeType=application/msword`,
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            // var jsonData = result.json()
            this.setState({ driveFileDownloadUrl: result.downloadUrl });
            console.log(result);
            console.log(this.state.driveFileDownloadUrl);
            download(result.downloadUrl, oauthToken);
          });
        
        function download(fileUrl, token) {
          if (fileUrl) {
            var accessToken = token;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", fileUrl);
            xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
            xhr.responseType = "blob";
            xhr.onload = function () {
              // callback(xhr.responseText);
              console.log(xhr.response);
              var reader = new FileReader();
              reader.readAsDataURL(xhr.response);
              reader.onloadend = function () {
                var base64data = reader.result;
                
                console.log(base64data);
              };
            };
            xhr.onerror = function () {
              console.log("error");
            };
            xhr.send();
          } else {
            // callback(null);
            console.log("failed");
          }
        }
      });

    picker.build().setVisible(true);
  }

  createPicker(oauthToken) {
    var google = window.google;
    this.onAuthenticate(oauthToken);

    if (this.createPicker) {
      return this.newcreatePicker(google, oauthToken);
    }

    const googleViewId = google.picker.ViewId[this.state.viewId];
    const view = new window.google.picker.View(googleViewId);

    if (this.state.mimeTypes) {
      view.setMimeTypes(this.state.mimeTypes.join(","));
    }
    if (this.state.query) {
      view.setQuery(this.state.query);
    }

    if (!view) {
      throw new Error("Can't find view by viewId");
    }

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(this.state.developerKey)
      .setCallback(this.onChange);

    if (this.state.origin) {
      picker.setOrigin(this.state.origin);
    }

    if (this.state.navHidden) {
      picker.enableFeature(window.google.picker.Feature.NAV_HIDDEN);
    }

    if (this.state.multiselect) {
      picker.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
    }

    picker.build().setVisible(true);
  }

  render() {
    return (
      <div onClick={this.onChoose}>
        {
          // this.props.children ?
          //   this.props.children :
          <button>Open google chooser</button>
        }
      </div>
    );
  }
}
