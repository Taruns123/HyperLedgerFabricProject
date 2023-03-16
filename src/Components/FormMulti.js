import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
// /////////////////////////////////////////////////////////////








export class FormMulti extends Component {

  constructor(props) {
    super(props);
    this.state = {value: '',
  isCommercial:'',
  isLoan: '',
 AssetValue: '',
ownerName1:'',
ownerName2:'',
taluka:'',
district:''
};
   
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeComm = this.handleChangeComm.bind(this);
    this.handleChangeLoan = this.handleChangeLoan.bind(this);
    this.handleChangeAsset = this.handleChangeAsset.bind(this);
    this.handleChangeOwner1 = this.handleChangeOwner1.bind(this);
    this.handleChangeOwner2 = this.handleChangeOwner2.bind(this);
    this.handleChangeTaluka = this.handleChangeTaluka.bind(this);
    this.handleChangeDistrict = this.handleChangeDistrict.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleChange(event) {    this.setState({value: event.target.value});  }
  handleChangeComm(event) {    this.setState({isCommercial: event.target.value});  }
  handleChangeLoan(event) {    this.setState({isLoan: event.target.value});  }
  handleChangeAsset(event) {    this.setState({AssetValue: event.target.value});  }
  handleChangeOwner1(event) {    this.setState({ownerName1: event.target.value});  }
  handleChangeOwner2(event) {    this.setState({ownerName2: event.target.value});  }
  handleChangeTaluka(event) {    this.setState({taluka: event.target.value});  }
  handleChangeDistrict(event) {    this.setState({district: event.target.value});  }
  handleSubmit(event) {
    alert('transaction submitted : ' + this.state.value);
    event.preventDefault();

    let url = ` http://localhost:4000/create/${this.state.value}/`;
    let url2 = ` http://localhost:4000/create/${this.state.value}/${this.state.isCommercial}/${this.state.isLoan}/${this.state.AssetValue}/${this.state.ownerName1 +" , "+this.state.ownerName2}/${this.state.taluka}/${this.state.district}`;

    
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
                <b>Enter the asset details</b></p>
                
            </div>
        <div className="form-group">
          <label for="exampleInputEmail1">Asset id</label>
          <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" 
        onChange={this.handleChange}>
      </input>    <small id="emailHelp" className="form-text text-muted"></small>
        </div>
        <div className="form-group">
          <label for="exampleInputEmail1">is it commercial</label>
          <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" onChange={this.handleChangeComm}  >
      </input>    <small id="emailHelp" className="form-text text-muted"> </small>
        </div>
        <div className="form-group">
          <label for="exampleInputEmail1">does it have a loan</label>
          <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"  onChange={this.handleChangeLoan} >
      </input>    <small id="emailHelp" className="form-text text-muted"> </small>
        </div>
        <div className="form-group">
          <label for="exampleInputEmail1">Asset Value</label>
          <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"  onChange={this.handleChangeAsset} >
      </input>    <small id="emailHelp" className="form-text text-muted"> </small>
        </div>
        <div className="form-group">
          <label for="exampleInputEmail1">Owner1</label>
          <input type="text" className="form-control" id="exampleInputPassword1" onChange={this.handleChangeOwner1} ></input>
        </div>
        <div className="form-group">
          <label for="exampleInputEmail1">Owner2</label>
          <input type="text" className="form-control" id="exampleInputPassword1" onChange={this.handleChangeOwner2} ></input>
        </div>
        <div className="form-group">
          <label for="exampleInputEmail1">Taluka</label>
          <input type="text" className="form-control" id="exampleInputPassword1" onChange={this.handleChangeTaluka} ></input>
        </div>
        <div className="form-group">
          <label for="exampleInputEmail1">District</label>
          <input type="text" className="form-control" id="exampleInputPassword1" onChange={this.handleChangeDistrict} ></input>
        </div>
        <div className="form-group form-check">
          <input type="checkbox" className="form-check-input" id="exampleCheck1"></input>
          <label className="form-check-label" for="exampleCheck1">Confirm the details</label>
        </div>
        
        <button type="submit" className="btn btn-primary" onClick={this.handleSubmit}>Submit</button>
      </form>
    )
  }
}

export default FormMulti