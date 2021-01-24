import React from 'react';
import {
  Link
} from "react-router-dom";

import './App.css';
import Book from './Book';
import IndexedDb from './IndexedDb';
import { FaShoppingCart, FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa';

import Pagination from "react-js-pagination";
import 'bootstrap/dist/css/bootstrap.min.css';

export interface ListState {
  allBooks: Array<any>;
  filteredBooks: Array<any>;
  currentPageBooks: Array<any>;
  errorMessage: string;
  searchValue: string;
  availableKeys: Array<{ keyName: string, isEnabled: boolean }>;
  cartData: any;

  currentPage: number;

  sorting: {
    isAsc: boolean | null,
    column: string
  }
}

export default class List extends React.Component<{}, ListState> {
  appDB: any;

  constructor(props: any) {
    super(props);

    this.state = {
      allBooks: [],
      filteredBooks: [],
      currentPageBooks: [],
      errorMessage: "",
      searchValue: "",
      availableKeys: [],
      cartData: [],

      currentPage: 1,

      sorting: {
        isAsc: true,
        column: "bookID"
      }
    };

    this.setState(this.state);
  }

  componentDidMount() {
    this.appDB = new IndexedDb("BOOKS-MALL");
    this.appDB.createObjectStore(["BOOKS", "CART"]).then(()=>{
      this.updateDB();
    });
  }

  updateDB(){
    let allBooksPromise = this.appDB.getAllValue("BOOKS");
    allBooksPromise.then((allBooks:any)=>{
      if (!allBooks.length) {
        fetch('https://s3-ap-southeast-1.amazonaws.com/he-public-data/books8f8fe52.json')
        // fetch('all-books.json', {
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Accept': 'application/json'
        //   }
        // })
        .then(async response => {
          const data = await response.json();
  
          // check for error response
          if (!response.ok) {
            // get error message from body or default to response statusText
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
          }
          
          //saving into DB
          await this.appDB.putBulkValue("BOOKS", data);
          this.setInitialBookState(data);          
        })
        .catch(error => {
          this.setState({ errorMessage: error.toString() });
          console.error('There was an error!', error);
        });
      } else{
        this.setInitialBookState(allBooks);
        this.appDB.getAllValue("CART").then((cartOldData:any[])=> this.setState({cartData: cartOldData}))
      }
    })
  }

  setInitialBookState(data:any[]): any{
    let availableKeys: any = [];
    if (data.length) {
      availableKeys = Object.keys(data[0]).map((key) => { return { keyName: key, isEnabled: true } });
    }

    this.setState({ allBooks: data, availableKeys: availableKeys });
    this.filterBooks("");
    this.handleLoadMore(1);
  }

  handleChange = (event: any) => {
    const { value } = event.target;
    this.setState({ searchValue: value });
    this.filterBooks(value);
  };

  filterBooks(value: string) {
    let filteredBooks = this.state.allBooks;

    if (this.state.searchValue) {
      filteredBooks = this.state.allBooks.filter((book) => {
        let allKeys = Object.keys(book);
        return (allKeys.some((key) => {
          return (book[key] || "").toString().toLowerCase().includes(value.toLowerCase());
        }));
      });
    }
    this.setState({ filteredBooks: filteredBooks });
  }

  updateStatus = (column: any): any => {
    let { id } = column.target;
    let ignoreColumns = ["bookID"];

    if(ignoreColumns.includes(id)) return;

    let ind = this.state.availableKeys.findIndex((key) => key.keyName === id);
    if (ind !== -1) {
      this.state.availableKeys[ind].isEnabled = !this.state.availableKeys[ind].isEnabled;

      this.setState({ availableKeys: this.state.availableKeys });
    }
  }

  addToCart = (bookID: number): any => {
    let book = this.state.filteredBooks.find((book) => book.bookID = bookID);
    let cartData = JSON.parse( JSON.stringify( this.state.cartData ) );
    cartData.push(book);
    this.appDB.putValue("CART", book);
    this.setState({cartData: cartData});
  }

  getUniqueKey(): number {
    return new Date().getTime();
  }

  getParsedName(inputData: string): string{
    return inputData.replace(/[_*,-]/g, ' ');
  }

  handleLoadMore(page:any) {
    let pageItem = 20;
    let sortedBooks = [];

    if( this.state.sorting.column ){
      sortedBooks = this.state.filteredBooks.sort((a,b)=>{
        var keyA = a[this.state.sorting.column],
          keyB = b[this.state.sorting.column];
        // Compare the 2 dates
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });
    }else sortedBooks = this.state.filteredBooks;

    if(!this.state.sorting.isAsc){
      sortedBooks = sortedBooks.reverse();
    }

    let filteredBooks = sortedBooks.slice( ((page-1) * pageItem), ((page-1) * pageItem) + pageItem );
    
    this.setState({currentPage: page, currentPageBooks: filteredBooks});
  }

  updateSortOrder(event:any): any{
    this.setState({sorting : {
      isAsc: !this.state.sorting.isAsc,
      column: this.state.sorting.column
    } });

    this.handleLoadMore(1);
  }

  updateSortField(event:any): any{
    this.setState({sorting : {
      isAsc: true,
      column: event.target.value
    } });

    this.handleLoadMore(1);
  }

  render() {
    let value = this.state.searchValue;
    
    return (
      <div className="app-container">
      <div id="search-container">
        <input className="form-control w-50" value={value} onChange={this.handleChange} placeholder="Find your books here.."></input>
        <label className="cart-container"><Link to={'/checkout'}><FaShoppingCart/><span className="cart-size-indicator">{this.state.cartData.length}</span></Link></label>
      </div>
      <div id="columnSelector">
        <h3>Customize Your Book View</h3>
        <p>Choose your required columns..</p>
        {
          this.state.availableKeys.map(column => (
            <span id={column.keyName} key={column.keyName} onClick={this.updateStatus} className={column.isEnabled ? 'active' : ''}>{this.getParsedName(column.keyName)}</span>
          ))
        }
      </div>
      
      <div className="app___sort-container">
        <div className="row">
          <div className="col-6 offset-6">
            <div className="column-sorting">{ this.state.sorting.isAsc ? <FaSortAmountUp onClick={this.updateSortOrder.bind(this)} /> :  <FaSortAmountDown onClick={this.updateSortOrder.bind(this)} /> }</div>
            <div className="column-selector">
              <label>Select a column to sort..</label>
              <select onChange={this.updateSortField.bind(this)} className="column-type form-control">
                {
                  this.state.availableKeys.map(column => (
                    <option value={column.keyName}>{this.getParsedName(column.keyName)}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        {
          this.state.currentPageBooks.map((book:any) => (
            <div className="col-sm-12 col-lg-4 col-md-6">
              <Book key={book.bookID} data={book} availableKeys={this.state.availableKeys} addToCart={this.addToCart} />
            </div>
          ))
        }
      </div>

      <div className="mt-5">
        <Pagination
          activePage={this.state.currentPage}
          itemsCountPerPage={20}
          totalItemsCount={this.state.filteredBooks.length}
          pageRangeDisplayed={5}
          onChange={this.handleLoadMore.bind(this)}
        />
      </div>

    </div>
    )
  }
}
