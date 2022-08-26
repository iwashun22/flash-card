'use strict';

// sample cards
const cardsMap = new Map([
   ['accept', '…を受け入れる'],
   ['achieve', '…を達成する'],
   ['acquire', '…を身につける'],
   ['affect', '…に影響を与える'],
   ['agree', '同意する'],
   ['allow', '…を許可する'],
   ['belong', '属する'],
   ['care', '気にかける (I care)\n注意 (take care)\n関心 (care about)'],
   ['compare', '…を比較する'],
   ['consider', '…について考える'],
   ['consume', '…を消費する'],
   ['decline', '…を断る'],
   ['depend', '依存する\n次第である']
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
searchAndDisplay();


//::: REMOVE CHECKED CARDS WHEN CLICK SOMEWHERE OFF ::://
document.addEventListener('click', e => {
   // console.log(e.path)
   const elements = e.composedPath();
   let containsCard = false;
   Array.from(elements).forEach(element => {
      if(containsCard) return;
      // need to check if there is a classname because it includes the whole document
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


//::: SEARCH CARDS ::://
searchInput.addEventListener('keypress', e => {
   if(e.key === 'Enter') {
      searchAndDisplay();
   }
})
searchButton.addEventListener('click', e => {
   searchAndDisplay();
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
      '作成',
      () => {
         if(inputTitle.value && textareaDescription.value) {
            createCard(true, inputTitle.value, textareaDescription.value)
            searchAndDisplay();
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

const searchButton = document.getElementById('trigger-search');
const searchInput = document.getElementById('search-card-input');

function searchAndDisplay() {
   const searchText = searchInput.value || null;
   let keys = Array.from(cardsMap.keys());
   if(searchText) {
      keys = keys.filter(key => key.search(searchText) !== -1);
      // sorting
      if(keys.length > 0) {
         const sortMap = new Map();
         keys.forEach(key => {
            const index = key.search(searchText);
            const array = sortMap.get(index) || [];
            array.push(key);
            sortMap.set(index, array);
         })
         keys = [];
         for(const [key, value] of sortMap.entries()) {
            const array = value;
            array.sort();
            keys.push(...array);
         }
      }
   } else {
      keys.sort();
   }
   cardsContainer.innerHTML = '';
   keys.forEach(key => {
      createCard(false, key);
   })
}

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
      if(!key || !value) throw new Error('no name or value is passed');
      const isAlreadyExist = cardsMap.get(key);
      if(isAlreadyExist) {
         createPopUp(
            { message: `既にカード名「${key}」は使用されています。上書きしますか？` },
            'いいえ',
            'はい',
            () => {
               cardsMap.set(key, value);
               const card = document.getElementById(key);
               const description = card.querySelector('.description');
               description.innerText = value;
            }
         )
         return;
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
   card.id = key;

   // SET TEXT
   const cardTitle = cloneCard.querySelector('.title');
   cardTitle.innerText = key;

   // SET DESCRIPTION
   const cardDescription = cloneCard.querySelector('.description');
   cardDescription.innerText = text;

   // ADD ANIMATION
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
   cardEdit.addEventListener('click', e => {
      function handle_empty() {
         const div = document.createElement('div');
         div.classList.add('flex-column');
         const h3 = document.createElement('h3');
         h3.innerText = key;
         const textarea = document.createElement('textarea');
         textarea.value = cardsMap.get(key);
         div.appendChild(h3);
         div.appendChild(textarea);
         createPopUp(
            { element: div },
            '破棄',
            '保存',
            () => {
               if(textarea.value) {
                  cardDescription.innerText = textarea.value;
                  cardsMap.set(key, textarea.value);
               } else {
                  createPopUp(
                     { message: 'テキストを入力していません。' },
                     '戻る',
                     '修正',
                     () => {
                        handle_empty();
                     }
                  );
               }
            }
         );
      }
      handle_empty();
   })

   // DELETE CARD
   const cardDelete = cloneCard.querySelector('.delete');
   cardDelete.addEventListener('click', e => {
      // console.log(node)
      createPopUp(
         { message: `本当にカード:'${key}'を削除しますか？` },
         'いいえ',
         'はい',
         () => {
            cardsContainer.removeChild(node);
            cardsMap.delete(key);
         }
      )
   })

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