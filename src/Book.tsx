import React from 'react';
import './App.css';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { BsStar } from 'react-icons/bs';

export interface BookProps{
  data: any;
  readOnly?: boolean;
  availableKeys:Array<any>;
  addToCart: CallableFunction;
}
export interface BookState {
  authors: string;
  average_rating: number;
  bookID: number;
  isbn: number;
  language_code: string;
  price: number;
  ratings_count: number;
  title: string;
}
export default class Book extends React.Component<BookProps, BookState> {

  constructor(props:any){
    super(props);
    this.state = {
      authors: props.data.authors,
      average_rating: props.data.average_rating,
      bookID: props.data.bookID,
      isbn: props.data.isbn,
      language_code: props.data.language_code,
      price: props.data.price,
      ratings_count: props.data.ratings_count,
      title: props.data.title
    };

    this.setState(this.state);
  }

  addToCart(){
    this.props.addToCart(this.state.bookID);
  }

  showThisField(keyName:string): boolean{
    let matchedKey = this.props.availableKeys.find((key)=> key.keyName == keyName);
    return matchedKey ? matchedKey.isEnabled : false;
  }

  getStars(value:number): any{
    let fullValue = Math.floor(value);
    let decimalVal = Math.round(value - fullValue);
    let res = [], totalStarCount = 5;
    for(var i =0; i< fullValue; i++){
      res.push(<FaStar/>);
    }
    for(var i =0; i< decimalVal; i++){
      res.push(<FaStarHalfAlt/>);
    }

    let filledCount = res.length;
    for(var i =0; i< (totalStarCount - filledCount); i++){
      res.push(<BsStar/>);
    }
    return res;
  }

  render(){
    let book:any = this.state;
    
    return(
      <div className="app___overall-container">
      <div className="app___book-container">
        <p className="book___ratings">
        {
          this.showThisField('average_rating') ? 
          <span className="book___avg-ratings">{this.getStars(book.average_rating)} from
          </span>
          : null
        }
        {
          this.showThisField('ratings_count') ? 
          <span className="book___tot-ratings"> {book.ratings_count} ratings</span>
          : null
        }
      </p>
      {
          this.showThisField('title') ? 
          <p className="app___book___title">{book.title}</p>
          : null
      }
      {
          this.showThisField('authors') ?
          <p className="app___book___authors"><span className="book___authour-prefix">by: </span>{book.authors}</p>
          : null
      }
      <p className="app___book___ids m-0">
        {
          this.showThisField('bookID') ?
          <span className="app___book___id">{book.bookID}</span>
          : null
        }
        {
          this.showThisField('isbn') ?
          <span className="app___book___isbn m-0">ISBN: {book.isbn}</span>
          : null
        }
      </p>
        {
          this.showThisField('language_code') ?
          <p className="app___book___lang-code m-0">Language: {book.language_code}</p>
          : null
        }
      {
        this.showThisField('price') ?
        <p className="app___book___price"><span className="book___price-prefix">₹</span>{book.price}</p>
        : null
      }
      { 
        this.props.readOnly ? '' : 
        <div className="book___add-to-cart-container mt-3">
          <button className="app___book___cart-btn form-control"
            onClick={this.addToCart.bind(this)}
          >Add To Cart</button>
        </div>
      }
    </div>
    </div>
    )
  }
}
