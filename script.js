'use strict';

// sample cards
const cardsMap = new Map([
   ['hello', 'hello world program'],
   ['apple', 'is a red fruit'],
   ['javascript', 'is my favorite programming language']
]);


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
   createCard(false, key);
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
      const checkedCards = document.querySelectorAll('.cards.checked');
      if(checkedCards.length > 0){
         Array.from(checkedCards).forEach(checkedCard => {
            flipCard(checkedCard, false);
         })
      }
   }
})


//::: ADD CARDS ::://
const addButton = document.getElementById('add-card');
addButton.addEventListener('click', e => {
   const cloneInputForm = inputFormTemplate.content.cloneNode(true);
   const div = cloneInputForm.querySelector('.input-layout');
   const id = (Math.random()*10000).toString(16).replace('.', '');
   const label = cloneInputForm.querySelector('label');
   const inputTitle = cloneInputForm.querySelector('input[type=text]');
   const textareaDescription = cloneInputForm.querySelector('textarea');
   inputTitle.id = id;
   label.setAttribute('for', id);
   createPopUp(
      { element: div },
      '破棄',
      '追加',
      () => {
         if(inputTitle.value && textareaDescription.value) {
            createCard(true, inputTitle.value, textareaDescription.value)
         }
      }
   )
})
});

const body = document.getElementsByTagName('body')[0];
const cardsContainer = document.getElementById('cards-container');
const cardTemplate = document.getElementById('cards-box-tmp');
const popUpTemplate = document.getElementById('pop-up-tmp');
const inputFormTemplate = document.getElementById('input-tmp');

/**
 * 
 * @param {Boolean} isNew
 * @param {String} key Map key
 * @param {String} value
 */
function createCard(isNew, key, value) {
   if(!key) return -1;
   let text;
   if(isNew) {
      if(!value) throw new Error('no value is passed');
      const isAlreadyExist = cardsMap.get(key);
      if(isAlreadyExist) {
         let canceled = true;
         createPopUp(
            { message: `既にカード名「${key}」は使用されています。上書きしますか？` },
            'いいえ',
            'はい',
            () => {
               cardsMap.set(key, value);
               text = value;
               canceled = false;
            }
         )
         if(canceled) return;
      } else {
         cardsMap.set(key, value);
         text = value;
      }
   } else {
      text = cardsMap.get(key); 
   }
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
      const checkedCards = document.querySelectorAll('.cards.checked');
      const alreadyChecked = card.classList.contains('checked');
      if(checkedCards.length > 0 && !alreadyChecked) {
         // delay
         Array.from(checkedCards).forEach(checkedCard => {
            setTimeout(() => {
               flipCard(checkedCard, false);
            }, 500);
         })
      }
      if(!alreadyChecked) {
         flipCard(card, true);
      }
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
 * 
 * @param {HTMLElement} card 
 * @param {Boolean} frontToBack
 */
function flipCard(card, frontToBack) {
   if(!card) return;
   let speed = 10;
   const frontFace = card.querySelector('.front');
   const backFace = card.querySelector('.back');
   const buttons = backFace.getElementsByTagName('button');
   Array.from(buttons).forEach(b => b.classList.add('hide'));

   // rotate 180
   let rotation = frontToBack ? 0 : 180;
   let rotate = frontToBack ? 5 : -5;
   let flipped = false;
   let flip = setInterval(() => {
      rotation += rotate;
      card.style.transform = `rotateY(${rotation}deg)`;
      frontFace.style.transform = `rotateY(${rotation}deg)`;
      backFace.style.transform = `rotateY(${rotation}deg)`;
      // hide other face
      if((rotation >= 90 && frontToBack && !flipped) ||
         (rotation <= 90 && !frontToBack && !flipped)) {
         flipped = true;
         frontToBack ?
            (() => {
               card.classList.add('checked')
               backFace.classList.remove('hide')
               frontFace.classList.add('hide')
            })()
         :
            (() => {
               card.classList.remove('checked');
               backFace.classList.add('hide')
               frontFace.classList.remove('hide')
            })()
      }
      if((rotation >= 180 && frontToBack) ||
         (rotation <= 0 && !frontToBack)) {
         // if the rotation went over 180, set back to 180
         rotation = frontToBack ? 180 : 0;
         frontFace.style.transform = `rotateY(${rotation}deg)`;
         backFace.style.transform = `rotateY(${rotation}deg)`;
         Array.from(buttons).forEach(b => b.classList.remove('hide'));
         clearInterval(flip);
      }
   }, speed)
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
            cardsMap.delete(cardName);
         }
      )
   })
}

/**
 * @param {Object} object passing message or element property
 * @param {String} object.message
 * @param {HTMLElement} object.element
 * @param {String} declineText
 * @param {String} confirmText 
 * @param {Function} callback function to execute after confirmation
 */
function createPopUp(object, declineText, confirmText, callback) {
   const clonePopUp = popUpTemplate.content.cloneNode(true);
   const node = clonePopUp.querySelector('.block-filter');

   // SET message or element
   const content = clonePopUp.querySelector('.content');
   if(object.message){  
      content.innerText = object.message;
   } else if(object.element) {
      content.innerHTML = '';
      content.appendChild(object.element)
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