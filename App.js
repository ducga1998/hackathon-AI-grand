import React, { Component } from 'react';
import { Linking, Button, StyleSheet, Text, View } from 'react-native';
import Auth from '@aws-amplify/auth';
import Analytics from '@aws-amplify/analytics';
import Amplify, { API, graphqlOperation, Storage } from 'aws-amplify';
import * as queries from './src/graphql/queries';
import awsconfig from './aws-exports';
import { withAuthenticator, S3Album } from 'aws-amplify-react-native';
Amplify.configure(awsconfig);
// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);
// send analytics events to Amazon Pinpoint
Analytics.configure(awsconfig);

Storage.configure({ level: 'private' });
class App extends Component {
  constructor(props) {
    super(props);
    this.handleAnalyticsClick = this.handleAnalyticsClick.bind(this);
    this.state = {
      resultHtml: <Text></Text>,
      eventsSent: 0,
      apiResponse: null,
      noteId: ''
    };
  }
  async getSample() {
    const allTodos = await API.graphql(graphqlOperation(queries.listComments));
    this.setState({ apiResponse: allTodos });
  }
  uploadFile = (evt) => {
    const file = evt.target.files[0];
    const name = file.name;

    Storage.put(name, file).then(() => {
      this.setState({ file: name });
    })
  }
  handleAnalyticsClick() {
    const { aws_project_region, aws_mobile_analytics_app_id } = awsconfig;

    Analytics.record('AWS Amplify Tutorial Event')
      .then((evt) => {
        const url = `https://${aws_project_region}.console.aws.amazon.com/pinpoint/home/?region=${aws_project_region}#/apps/${aws_mobile_analytics_app_id}/analytics/events`;
        const result = (
          <View>
            <Text>Event Submitted.</Text>
            <Text>Events sent: {this.state.eventsSent + 1}</Text>
            <Text style={styles.link} onPress={() => Linking.openURL(url)}>
              View Events on the Amazon Pinpoint Console
                </Text>
          </View>
        );
        this.setState({
          resultHtml: result,
          eventsSent: this.state.eventsSent + 1
        });
      });
  };

  // Create a new Note according to the columns we defined earlier
  async saveNote() {
    let newNote = {
      body: {
        "NoteTitle": "My first note!",
        "NoteContent": "This is so cool!",
        "NoteId": this.state.noteId
      }
    }
    const path = "/Notes";

    // Use the API module to save the note to the database
    try {
      const apiResponse = await API.put("NotesCRUD", path, newNote)
      console.log("response from saving note: " + apiResponse);
      this.setState({ apiResponse });
    } catch (e) {
      console.log(e);
    }
  }

  handleChangeNoteId = (event) => {
    this.setState({ noteId: event });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text>Welcome to your React Native App with Amplify!</Text>
        <Button title="Generate Analytics Event" onPress={this.handleAnalyticsClick} />
        {this.state.resultHtml}
        <View>
          <Button title="Send Request" onPress={this.getSample.bind(this)} />
          <Text>Response: {this.state.apiResponse && JSON.stringify(this.state.apiResponse)}</Text>
        </View>

        {/* <input type="file" onChange={this.uploadFile} /> */}
        <S3Album level="private" path='' />

      </View>
    );
  }
}
export default withAuthenticator(App)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    color: 'blue'
  }
});