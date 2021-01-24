import React from 'react';
import './App.css';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { BsStar } from 'react-icons/bs';
import Book from './Book';
import IndexedDb from './IndexedDb';

export interface CheckoutState {
  cartData: Array<any>,
  availableKeys: Array<any>
}
export default class Checkout extends React.Component<{}, CheckoutState> {
  appDB: any;
  
  constructor(props:any){
    super(props);
    this.state = {
      cartData: [],
      availableKeys: []
    }
  }

  componentDidMount() {
    this.appDB = new IndexedDb("BOOKS-MALL");
    this.appDB.createObjectStore(["BOOKS", "CART"]).then(()=>{
      this.appDB.getAllValue("CART").then((allBooks:any)=>{
        this.setState({ cartData: allBooks });
      })
    });
  }

  getGrandTotal(): any{
    let total = 0;
    total = this.state.cartData.reduce((tot, book) => {
      return tot + Number( book.price );
    }, 0);
    return total;
  }

  render(){
    let availableKeys:any = [];
    if(this.state.cartData && this.state.cartData.length){
      availableKeys = Object.keys(this.state.cartData[0]).map((key) => { return { keyName: key, isEnabled: true } });
    }
    
    return(
      <div className="app___checkout-container app-container">
        <h3>Checkout Page</h3>
        <div className="row">
          {
            this.state.cartData.map((book:any) => (
              <div className="col-sm-12 col-lg-4 col-md-6">
                <Book key={book.bookID} data={book} readOnly={true} availableKeys={availableKeys} addToCart={()=>{}} />
              </div>
            ))
          }
          
        </div>
        <h3>Grand Total  <span className="checkout__price">₹{ this.getGrandTotal()}</span></h3>
      </div>
    )
  }
}
