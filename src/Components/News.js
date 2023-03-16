import React, { Component } from 'react'
import NewsItem from './NewsItem'
import Spinner from './Spinner';
import PropTypes from 'prop-types'

export class News extends Component {
    //  articles = [];

     static defaultProps = {
        country : 'in',
        pageSize : 8,
        category : 'science'

     }
     static propTypes = {
          country : PropTypes.string,
          pageSize : PropTypes.number,
          category : PropTypes.string
     }

    constructor(props){
        super(props);
        // alert("constructor runs in news component");
        document.title = "NewsMonkey -"+this.props.category;
        this.state = {
            articles : [],
            loading : false,
            page : 1

        }
      }

  async componentDidMount(){
    this.setState({
      loading : true
    })
    let url = `https://newsapi.org/v2/top-headlines?country=${this.props.country}&category=${this.props.category}&apiKey=f2185a8911b84cdbb8456ce360d5f9f8&page=1&pageSize=${this.props.pageSize}`;
    let data = await fetch(url);
    console.log(data);
    let parsedData  = await data.json();
    console.log(parsedData);
    this.setState({
      articles: parsedData.articles,
      loading : false
    })
  }

  handleNextClick = async()=>{
    this.setState({
      page : this.state.page+1,
      loading : true
    })
    
    let url = `https://newsapi.org/v2/top-headlines?country=${this.props.country}&category=${this.props.category}&apiKey=f2185a8911b84cdbb8456ce360d5f9f8&page=${this.state.page}&pageSize=${this.props.pageSize}`;
     let data = await fetch(url);
    console.log(data);
    let parsedData  = await data.json();
    console.log(parsedData);
    this.setState({
      articles: parsedData.articles,
      loading : false
    })
  }
  handlePrevClick = async( )=>{
    
    this.setState({
      page : this.state.page-1,
      loading : true
    })
    let url = `https://newsapi.org/v2/top-headlines?country=${this.props.country}&category=${this.props.category}&apiKey=f2185a8911b84cdbb8456ce360d5f9f8&page=${this.state.page}&pageSize=${this.props.pageSize}`;
    let data = await fetch(url);

    console.log(data);
    let parsedData  = await data.json();
    console.log(parsedData);
    this.setState({
      articles: parsedData.articles,
      loading : false
    })
  }
  render() {
    return (
      <div className='container my-3 '>
        <h1 className='text-center' style={{marginTop : "100px"}} >News Monkey - Top headlines</h1>
        {/* {this.state.loading && <Spinner/>} */}
        <div className="row">
        {this.state.articles.map((element)=>{
            // console.log(element);
         
            return <div className="col-md-4" key = {element.url}>
                <NewsItem  title = {element.title?.slice(0, 45)} description = { element.description?.slice(0, 60)} imageUrl = {element.urlToImage?element.urlToImage:"https://c.ndtvimg.com/2022-05/pp91hu2o_mahesh_625x300_31_May_22.jpg"} newsUrl = {element.url} author={element.author} date = {(element.publishedAt)}/>
            </div>
                
        })}
           
        </div>
       <div className='container d-flex justify-content-between'>
        <button disabled ={this.state.page<=1} type="button" className='btn btn-dark ' onClick={this.handlePrevClick}>&larr; prev</button>
        <button type="button" className='btn btn-dark' onClick={this.handleNextClick}>next &rarr;</button>
       </div>

      </div>
    )
  }
}

export default News