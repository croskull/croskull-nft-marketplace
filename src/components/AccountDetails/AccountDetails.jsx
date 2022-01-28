import React from "react";
import './AccountDetails.css';
import banner from "./banner.png"

const AccountDetails = ({ accountAddress, accountBalance }) => {
  
  var els = document.getElementsByClassName("page");
  Array.from(els).forEach((el) => {
    // Do stuff here
    console.log("page");
    el.addEventListener('click', function() {
      el.classList.remove('no-anim');
      el.classList.toggle('flipped');
      Array.from(document.getElementsByClassName("page > div")).forEach((el2) => {
        el2.stopPropagation();
      });
 reorder()
  }, false);
});


function reorder(){
  var els = document.getElementsByClassName("book");
  Array.from(els).forEach((el) => {
    var pages = el.querySelectorAll(".page");
    var pages_flipped = el.querySelectorAll(".flipped");
    Array.from(pages).forEach( (p,i) => {
      console.log(i);
      p.style.zIndex = pages.length-i;
    });
    Array.from(pages_flipped).forEach( (pf,i) => {
      console.log(i);
      pf.style.zIndex = i+1;
    });
  });
}

reorder();
  /*


function reorder(){
   (".book").each(function(){
    var pages=(this).find(".page")
    var pages_flipped=(this).find(".flipped")
    pages.each(function(i){
        (this).css("z-index",pages.length-i)
    })
    pages_flipped.each(function(i){
        (this).css("z-index",i+1)
    })
   });    
}
 reorder();
*/
  return (
    
    <div className="container ac-home">
      <h1 className="ac-title">CroSkull NFT</h1>
      <p className="ac-text ac-br">
        The Croskull is a collection of 6,666 uniquely generated NFTs stored in the Cronos Chain.
        <br></br>
        Each Croskull NFT is based on 6+ attributes with different rarities.
      </p>
      <p className="ac-text ac-br">
        Want to know more? <span><a className="link" href="https://www.croskull.com">Click Here!</a></span>
      </p>
      <hr className="my-4" />
      <p className="ac-text">Account address :</p>
      <h4 className="ac-text">{accountAddress}</h4>
      <p className="ac-text">Account balance :</p>
      <h4 className="ac-text">{accountBalance} CRO</h4>
      <img
        src={banner}
        width={"100%"}
        alt="CroSkulls Banner"
      />
    </div>
  );
};

export default AccountDetails;
