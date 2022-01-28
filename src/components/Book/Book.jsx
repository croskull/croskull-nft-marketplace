import React from "react";
import './Book.css';
import banner from "./banner.png"

const Book = ({ accountAddress, accountBalance }) => {
  
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
  return (
    <div className="book-container">
      <div class='book'>
        <div id='page-1' class='page no-anim'>
          <div class='side-1' id='p1'>
            <div class='content'>
              <h2>Diego</h2>
              <p>
                Un giorno Diego chiese le foto delle menne di francy, ma tra il dire e il fare c'è di mezzo fefe, che gelosa del fatto, tirò uno schiaffo rovente a Diego e prese a male lingue la povera francy. Nel mentre Giiko impazziva su discord con Drago e Osho.
                </p>
                <img src={banner} style={{width: '100%'}} />
            </div>
          </div>
          <div class='side-2' id='p2'>
            <div class='content'>
              <h2>2</h2>
              <p>
                Here Lord Vivec met a poor farmer whose guar had died. The farmer could not harvest his muck without his guar, and he could not provide for his family or his village. So the Lord Vivec removed his fine clothes and toiled in the fields like a beast of burden until the crop was harvested. It is at the Fields of Kummu we go to pray for the same humility Lord Vivec showed on that day.
              </p>
              <p>
                The Fields of Kummu are west of Suran on the north shore of Lake Amaya as you head towards Pelagiad. The shrine is between two rocks, and most easily noticed while traveling east along the road. Alof's farm nearby has a small dock on the north bank of Lake Amaya. This is the only dock nearby which Alof kindly allows servants of the Temple to use. It is customary to leave a portion of muck at the shrine to represent Vivec's humility.
              </p>
            </div>
          </div>
        </div>

        <div id='page-2' class='page no-anim'>
          <div class='side-1' id='p3'>
            <div class='content'>
              <h2>3</h2>
              <p>
                When Sheogorath rebelled against the Tribunal, he tricked the moon Baar Dau into forsaking its appointed path through Oblivion. The Mad Star inspired the moon to hurl itself upon Vivec's new city, which Sheogorath claimed was built in mockery of the heavens. When Vivec learned of Sheogorath's scheme, he froze the rogue moon in the sky with a single gesture and the grace of his countenance. Overwhelmed by the courage and daring of Vivec, the moon Baar Dau swore itself to eternal service of the Tribunal and all its works. Thus the moon now stands guard over the palace, and serves as a citadel for the Temple's Ordinators.
              </p>
              <p>
                The Shrine of Daring is found in the city of Vivec, in the Temple District, along the western wall of the High Fane, the great Temple of Vvardenfell. When you address the shrine, it is customary to leave behind a Potion of Rising Force. Suitable potions may be purchased from the Temple. Homemade potions are not acceptable.
              </p>
            </div>
          </div>
          <div class='side-2' id='p4'>
            <div class='content'>
              <h2>4</h2>
              <p>
                Long after Lord Nerevar and the Tribunal triumphed over Dagoth Ur, the people wished to build a monument to the heroes of that war. Vivec thanked them, but said that it would be better to dedicate a monument not only to the glorious heroes, but to all people, great and small, who suffered and died in the war. It became the custom to make offerings here, either in thanks of our good fortune, or for those less fortunate.
              </p>
              <p>
                The Shrine of Generosity is on the top steps of Vivec's Palace, the southernmost Canton of Vivec City. The customary donation for those in good fortune is 100 gold.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
};

export default Book;
