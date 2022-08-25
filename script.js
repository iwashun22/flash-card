'use strict';

const cardsMap = new Map();
cardsMap.set('hello', 'hello world program');
cardsMap.set('apple', 'is a red fruit');
cardsMap.set('javascript', 'is my favorite programming language');


window.addEventListener('load', () => {
   
//::: BACKGROUND MOUSEMOVE EFFECT ::://
const bg = document.querySelector('.background');
let timeOut = true;
document.addEventListener('mousemove', e => {
   if(timeOut) {
      const span = document.createElement('span');
      span.className = 'polygon'
      span.style.top = e.clientY + 'px';
      span.style.left = e.clientX + 'px';
      bg.appendChild(span);
      setTimeout(() => {
         bg.removeChild(span);
      }, 1000);
      timeOut = false;
      setTimeout(() => {
         timeOut = true;
      }, 80)
   }
})


//::: ADDING INITIAL CARDS TO DOCUMENT ::://
const keys = Array.from(cardsMap.keys());
keys.forEach(key => {
   createCard(key);
})

//::: REMOVE CHECKED CARDS WHEN CLICK SOMEWHERE OFF ::://
document.addEventListener('click', e => {
   // console.log(e.path)
   const elements = e.composedPath();
   let containsCard = false;
   Array.from(elements).forEach(element => {
      if(containsCard) return;
      if(element.className) {
         if(element.classList.contains('cards')) {
            containsCard = true;
         }
      }
   })
   if(!containsCard) {
      const card = document.querySelector('.cards.checked');
      if(card){
         card.classList.remove('checked');
         const buttons = card.getElementsByTagName('button');
         Array.from(buttons).forEach(b => b.classList.add('hide'));
      }
   }
})

});

const body = document.getElementsByTagName('body')[0];
const cardsContainer = document.getElementById('cards-container');
const cardTemplate = document.getElementById('cards-box-tmp');
const popUpTemplate = document.getElementById('pop-up-tmp');

/**
 * 
 * @param {String} key Map key
 */
function createCard(key) {
   if(!key) return -1;
   const text = cardsMap.get(key); 
   const cloneCard = cardTemplate.content.cloneNode(true);
   const node = cloneCard.querySelector('.cards-box');
   const card = cloneCard.querySelector('.cards');

   // SET TEXT
   const cardTitle = cloneCard.querySelector('.title');
   cardTitle.innerText = key;

   // SET DESCRIPTION
   const cardDescription = cloneCard.querySelector('.description');
   cardDescription.innerText = text;

   // ADD CHECK EVENT
   card.addEventListener('click', e => {
      const checkedCard = document.querySelector('.cards.checked');
      if(checkedCard) {
         checkedCard.classList.remove('checked');
         const buttons = checkedCard.getElementsByTagName('button');
         Array.from(buttons).forEach(b => b.classList.add('hide'));
      }
      const buttons = card.getElementsByTagName('button');
      Array.from(buttons).forEach(b => b.classList.remove('hide'));
      card.classList.add('checked');
   })

   // EDIT CARD
   const cardEdit = cloneCard.querySelector('.edit');

   // DELETE CARD
   const cardDelete = cloneCard.querySelector('.delete');
   deleteButton(cardDelete, cardsContainer, node, key);

   // APPEND
   cardsContainer.appendChild(cloneCard);
}

/**
 * @param {HTMLButtonElement} button button element
 * @param {HTMLElement} parentNode cards container
 * @param {HTMLElement} node card to delete
 */
function deleteButton(button, parentNode, node, cardName) {
   button.addEventListener('click', e => {
      // console.log(node)
      createPopUp(
         { message: `本当にカード:'${cardName}'を削除しますか？` },
         'いいえ',
         'はい',
         () => {
            parentNode.removeChild(node);
         }
      )
   })
}

/**
 * @param {Object} object passing message or element property
 * @param {String} declineText
 * @param {String} confirmText 
 * @param {Function} callback function to execute after confirmation
 */
function createPopUp(object, declineText, confirmText, callback) {
   const clonePopUp = popUpTemplate.content.cloneNode(true);
   const node = clonePopUp.querySelector('.block-filter');

   // SET message or element
   if(object.message){  
      clonePopUp.querySelector('.content').innerText = object.message;
   } else if(object.element) {
      clonePopUp.querySelector('.content').appendChild(object.element)
   } else {
      return new Error('Provide message or element');
   }

   // SET declineText
   clonePopUp.querySelector('.decline').innerText = declineText || 'cancel';

   // SET confirmText
   clonePopUp.querySelector('.confirm').innerText = confirmText || 'ok';

   // HIDE POP UP
   clonePopUp.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
         body.removeChild(node);
         // check if it was a confirm button
         if(button.innerText === confirmText) 
            callback();
      })
   })
   body.appendChild(clonePopUp);
}