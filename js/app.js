/**
    React
*/
class Record extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            firstname: '',
            lastname: ''
        };

        this.record = this.props.record;

        this.handleChange = this.handleChange.bind(this);

        this.record.subscribe(value => {
            this.setState({firstname: value.firstname});
            this.setState({lastname: value.lastname});
        });
    }

    handleChange(e) {
        if(e.target.id === 'firstname'){
            this.setState({firstname: e.target.value});
            this.record.set('firstname', e.target.value);
        } else if(e.target.id === 'lastname'){
            this.setState({lastname: e.target.value});
            this.record.set('lastname', e.target.value);
        }
    }

    render() {
        return(
            <div className="group realtimedb">
                <h2>Realtime Datastore</h2>
                <div className="input-group half left">
                    <label>Firstname</label>
                    <input type="text" value={this.state.firstname} onChange={this.handleChange} id="firstname"/>
                </div>
                <div className="input-group half">
                    <label>Lastname</label>
                    <input type="text" value={this.state.lastname} onChange={this.handleChange} id="lastname"/>
                </div>
            </div>
        );
    }
}

/**
 Events Component
*/

class Events extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            eventsReceived: []
        };
        this.event = this.props.event;

        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.event.subscribe('event-data', data => {
            this.setState({eventsReceived: [...this.state.eventsReceived, data]})
            this.setState({value: ''});
        });
    }

    handleClick(e) {
        this.event.emit('event-data', this.state.value);
    }

    handleChange(e) {
        this.setState({value: e.target.value});
    }

    render() {
        return(
            <div className="group pubsub">
                <div className="half left">
                    <h2>Publish</h2>
                    <button className="half left" onClick={this.handleClick} >Send test-event with</button>
                    <input type="text" value={this.state.value} onChange={this.handleChange} className="half"/>
                </div>
                <div className="half">
                    <h2>Subscribe</h2>
                    <ul>
                        {
                            this.state.eventsReceived
                                .map(val => {
                                    return (
                                        <li key={this.state.eventsReceived.indexOf(val)} >Received event data: <em>{val}</em></li>
                                        );
                                })
                        }
                    </ul>
                </div>
            </div>
        );
    }
}

/**
 RPC Component
*/

class RPC extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            requestValue: '3',
            responseValue: '7',
            displayResponse: '-'
        };
        this.rpc = this.props.rpc;

        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);

        // Register as a provider for multiply-number
        this.rpc.provide('multiply-number', function( data, response ){
            // respond to the request by multiplying the incoming number
            // with the one from the response input
            response.send(data.value * parseFloat(this.state.responseValue));
        }.bind(this));
    }

    handleClick(e) {
        // read the value from the input field
        // and convert it into a number
        var data = {
            value: parseFloat(this.state.requestValue)
        };

        // Make a request for `multiply-number` with our data object
        // and wait for the response
        this.rpc.make('multiply-number', data, function( err, resp ){

            //display the response (or an error)
            this.setState({displayResponse: resp || err.toString()});
        }.bind(this));
    }

    handleChange(e) {
            if(e.target.id === 'request-value'){
            this.setState({requestValue: e.target.value});
        } else if(e.target.id === 'response-value'){
            this.setState({responseValue: e.target.value});
        }
    }

    render() {
        return(
                <div className="group reqres">
                    <div className="half left">
                        <h2>Request</h2>
                        <button className="half left" id="make-rpc" onClick={this.handleClick}>Make multiply request</button>
                        <div className="half">
                            <input type="text" id="request-value" className="half left"
                            value={this.state.requestValue} onChange={this.handleChange}/>
                            <span className="response half item" id="display-response">
                                {this.state.displayResponse}
                            </span>
                        </div>
                    </div>
                    <div className="half">
                        <h2>Response</h2>
                        <div className="half left item">Multiply number with:</div>
                        <input type="text" className="half" id="response-value" 
                        value={this.state.responseValue} onChange={this.handleChange} />
                    </div>
                </div>
        );
    }
}

/**
 App Component
*/

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        value: '',
        connectionState: 'INITIAL'
        };

        this.ds = deepstream('wss://154.deepstreamhub.com?apiKey=97a397bd-ccd2-498f-a520-aacc9f67373c');

        this.ds.on( 'connectionStateChanged', this.handleConnectionState.bind(this));
        this.ds.on('error', error => console.error(error));

        this.client = this.ds.login();

        this.record = this.client.record.getRecord('test/johndoe');
        this.event = this.client.event;
        this.rpc = this.client.rpc;

        this.handleChange = this.handleChange.bind(this);

    }


    handleConnectionState( connectionState ){
        this.setState({connectionState: connectionState});
    }

    handleChange(e) {
        this.setState({value: e.target.value});
        this.record.set('firstname', e.target.value);
    }

    render() {
        return (
        <div className="App">
                <div className="group connectionState">
                Connection-State is: <em id="connection-state">{this.state.connectionState}</em>
            </div>
            <Record record={this.record}></Record>
            <Events event={this.event}></Events>
            <RPC rpc={this.rpc}></RPC>
        </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('app')
);