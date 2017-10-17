import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  FlatList,
  AsyncStorage,
  Button,
  TextInput,
  Keyboard,
  Platform,
  Dimensions,
  Animated,
  Easing,
  Image,
} from "react-native";
import { ColorPicker, toHsv } from 'react-native-color-picker';
import Modal from 'react-native-modalbox';
import SortableList from 'react-native-sortable-list';
import SortableListView from 'react-native-sortable-listview'

const isAndroid = Platform.OS == "android";
const viewPadding = 10;
const window = Dimensions.get('window');
const colorCode = "&$&COLOR_&$&";

export default class TodoList extends Component {

  constructor(props) {
    super(props)
    this.onColorChange = this.onColorChange.bind(this)
    this.onChange = this.changeColor.bind(this)
    this.state = {
      color: "red",
      currentColor: "red",
      isOpen: false,
      isDisabled: false,
      swipeToClose: true,
      sliderValue: 0.3,
      tasks: [],
      text: "",
      textColor: "",
    };
  }

  changeColor(color)
  {
    console.log('clicked ')
    this.setState({currentColor: color})
    this.setState({textColor: color})
  }

  onColorChange(color) {
    this.setState({ color })
  }

  changeTextHandler = text => {
    this.setState({ text: text });
  };

  addTask = () => {
    let notEmpty = this.state.text.trim().length > 0;

    if (notEmpty) {
      this.setState(
        prevState => {
          let { tasks, text } = prevState;
          return {
            tasks: tasks.concat({ key: tasks.length, text: text }),
            text: ""
          };
        },
        () => Tasks.save(this.state.tasks)
      )
    }
  };

  deleteTask = i => {
    this.setState(
      prevState => {
        let tasks = prevState.tasks.slice();

        tasks.splice(i, 1);

        return {
          tasks: tasks
        };
      },
      () => {
        Tasks.save(this.state.tasks)
      }
    );
  };

  getString(string, num)
  {
    var parts = string.split(colorCode);
    return parts[num]
  }

  componentDidMount() {
    Keyboard.addListener(
      isAndroid ? "keyboardDidShow" : "keyboardWillShow",
      e => this.setState({ viewPadding: e.endCoordinates.height + viewPadding })
    );

    Keyboard.addListener(
      isAndroid ? "keyboardDidHide" : "keyboardWillHide",
      () => this.setState({ viewPadding: viewPadding })
    );

    Tasks.all(tasks => this.setState({ tasks: tasks || [] }));
  }

  render() {
    return (
      <View
        style={styles.container}
      >

        <Text style={styles.title}>Color todo</Text>
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.contentContainer}
          data={this.state.tasks}
          renderItem={({ item, index })=>
          <View>
            <View
              style={styles.listItemCont}
              backgroundColor={this.getString(item.text, 1)}>
              <Text style={styles.listItem}>
                {"  "}{this.getString(item.text, 0)}
              </Text>
              <Button title="X" color="#ffffff" onPress={() => this.deleteTask(index)} />
            </View>
            <View style={styles.hr} />
          </View>}
        />
        <Button
          title="Add new task"
          fontSize="50"
          onPress={() => {this.refs.modal1.open(), text= ""}}
        />
        <Modal
          style={[styles.modal, styles.modal3]}
          ref="modal1"
          swipeToClose={this.state.swipeToClose}
          onClosed={this.onClose}
          onOpened={this.onOpen}
          onClosingState={this.onClosingState}>
            <Text style={styles.dialogText} >Add new task</Text>
            <TextInput
              style={styles.textInput}
              color="white"
              onChangeText={this.changeTextHandler}
              backgroundColor={this.state.currentColor}
              value={this.state.text}
              placeholder="Add Tasks"
            />
            <Button
              title = "Change background color..."
              onPress={() => this.refs.modal2.open()}
            >
            </Button>
            <Button
              title = "Add"
              onPress={() => {
                this.refs.modal1.close(),
                this.state.text = this.state.text + colorCode + this.state.currentColor
                this.addTask()}}
            >
              Disable swipeToClose({this.state.swipeToClose ? "true" : "false"})
            </Button>
        </Modal>
        <Modal
          style={[styles.modal1]}
          ref="modal2"
          swipeToClose={this.state.swipeToClose}
          onClosed={this.onClose}
          onOpened={this.onOpen}
          onClosingState={this.onClosingState}
        >
            <Text style={styles.dialogText}>Choose color...</Text>
            <ColorPicker
              paddingLeft="20"
              paddingRight="20"
              color={this.state.color}
              onColorChange={this.onColorChange}
              onColorSelected={color =>{
                this.changeColor(color),
                this.refs.modal2.close()}}
              style={{flex: 1}}
            />
            <Text style={styles.textCenter}>Tap on the cicle to choose that color</Text>
        </Modal>
      </View>

    );
  }
}

let Tasks = {
  convertToArrayOfObject(tasks, callback) {
    return callback(
      tasks ? tasks.split("||").map((task, i) => ({ key: i, text: task })) : []
    );
  },
  convertToStringWithSeparators(tasks) {
    return tasks.map(task => task.text).join("||");
  },
  all(callback) {
    return AsyncStorage.getItem("TASKS", (err, tasks) =>
      this.convertToArrayOfObject(tasks, callback)
    );
  },
  save(tasks) {
    AsyncStorage.setItem("TASKS", this.convertToStringWithSeparators(tasks));
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingBottom: 20,

    ...Platform.select({
      ios: {
        paddingTop: 20,
      },
    }),
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    paddingTop: 15,
    paddingBottom: 10
  },
  list: {
    flex: 1,
  },
  listItem: {
    paddingTop: 2,
    paddingBottom: 2,
    fontSize: 18,
    color: "white"
  },
  hr: {
    height: 1,
    backgroundColor: "white"
  },
  listItemCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  textInput: {
    height: 40,
    paddingRight: 10,
    paddingLeft: 10,
    borderColor: "transparent",
    borderRadius: 4,
    borderWidth: isAndroid ? 0 : 1,
    width: "90%"
  },
  dialogText: {
    paddingTop: 20,
    paddingBottom: 20,
    fontSize: 30,
    textAlign: "center"
  },
  wrapper: {
   paddingTop: 50,
   flex: 1
 },

 modal: {
   justifyContent: 'center',
   alignItems: 'center'
 },

 modal2: {
   height: 230,
   backgroundColor: "white",
   borderRadius: 4,
 },

 modal3: {
   height: 300,
   width: 300,
   borderRadius: 10,
 },

 text: {
   color: "white",
   fontSize: 22
 },

 textCenter: {
   fontSize: 16,
   alignItems: "center",
   justifyContent: "center",
   textAlign: "center",
   paddingBottom: 20,
 },
 contentContainer: {
    width: window.width,
    paddingHorizontal: 30
  },

  row: {    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    height: 80,
    flex: 1,
    marginTop: 7,
    marginBottom: 12,
    borderRadius: 4,


    ...Platform.select({
      ios: {
        width: window.width - 30 * 2,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOpacity: 1,
        shadowOffset: {height: 2, width: 2},
        shadowRadius: 2,
      },

      android: {
        width: window.width - 30 * 2,
        elevation: 0,
        marginHorizontal: 30,
      },
    })
  },

});

AppRegistry.registerComponent("TodoList", () => TodoList);
