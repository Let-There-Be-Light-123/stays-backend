import React from "react";
import Config from "./config/config";
class MyComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        error: null,
        isLoaded: false,
        users: []
      };
    }
  
    componentDidMount() {
      fetch(`${Config.BASE_URL}/api/properties`)
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              isLoaded: true,
              users: result
            });
          },
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        )
    }
  
    render() {
      const { error, isLoaded, users } = this.state;
      if (error) {
        return <div>Error: {error.message}</div>;
      } else if (!isLoaded) {
        return <div>Loading...</div>;
      } else {
        return (
          <ul>
            {users.map(item => (
              <li key={item.propertyid}>
                {item.name} 
              </li>
            ))}
          </ul>
        );
      }
    }
  }
  export default MyComponent;