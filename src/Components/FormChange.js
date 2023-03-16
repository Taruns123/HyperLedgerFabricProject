import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
// /////////////////////////////////////////////////////////////








export class FormChange extends Component {

  constructor(props) {
    super(props);
    this.state = {value: '',
  isCommercial:''
};
   
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeComm = this.handleChangeComm.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleChange(event) {    this.setState({value: event.target.value});  }
  handleChangeComm(event) {    this.setState({isCommercial: event.target.value});  }
  handleSubmit(event) {
    alert('transaction completed : ' + this.state.value);
    event.preventDefault();

    
let url2 = `http://localhost:4000/changeOwner/${this.state.value}/${this.state.isCommercial}`;

    
 let data = fetch(url2);
console.log(data);
let parsedData  = data.json();
console.log(parsedData);
this.setState({
  articles: parsedData.articles,
  loading : false
})
  }




  render() {
    return (
        <form className='container'>
            <div className='container' style={{fontSize: '2em', color: 'grey'}}>
                
                <p><br></br> 
                <b>Enter the details to transfer the asset</b></p>
                
            </div>
        <div className="form-group">
          <label for="exampleInputEmail1">Land id</label>
          <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" 
        onChange={this.handleChange}>
      </input>    <small id="emailHelp" className="form-text text-muted"></small>
        </div>
        <div className="form-group">
          <label for="exampleInputEmail1">Transfer from</label>
          <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"   >
      </input>    <small id="emailHelp" className="form-text text-muted"> </small>
        </div>
        <div className="form-group">
          <label for="exampleInputEmail1">Transfer To</label>
          <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" onChange={this.handleChangeComm}  >
      </input>    <small id="emailHelp" className="form-text text-muted"> </small>
        </div>
        
        
        <div className="form-group form-check">
          <input type="checkbox" className="form-check-input" id="exampleCheck1"></input>
          <label className="form-check-label" for="exampleCheck1">Confirm the details</label>
        </div>
        
        <button type="submit" className="btn btn-primary" onClick={this.handleSubmit}>Transfer Asset</button>
      </form>
    )
  }
}

export default FormChange