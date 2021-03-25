"use strict";
const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});
const btnCart = document.querySelector('.button-cart'),
			modalCart = document.querySelector('#modal-cart'),
			overlayClose = document.querySelector('.overlay'),
			modalClose = overlayClose.querySelector('.modal-close'),
			btnPromo = document.querySelectorAll('button.catalog'),
			more = document.querySelector('.more'),
			navigationLink = document.querySelectorAll('.navigation-link'),
			longGoodsList = document.querySelector('.long-goods-list'),
			cartTableGoods = document.querySelector('.cart-table__goods'),
			cartTableTotal = document.querySelector('.card-table__total'),
			cartCount = document.querySelector('.cart-count');
//cart 
const cart = {
	cartGoods :[],
	get count() {
    if (this.cartGoods.length === 0) {
      cartCount.textContent = '0';
    }else{
    cartCount.textContent = [this.cartGoods.length + 1];}
		return cartCount;
  },
	renderCart(){
		cartTableGoods.textContent ='';
		this.cartGoods.forEach(({id, name, price, count})=>{
			const trGood = document.createElement('tr');
			trGood.className = 'cart-item';
			trGood.dataset.id = id;

			trGood.innerHTML = `
			<td>${name}</td>
			<td>${price}$</td>
			<td><button class="cart-btn-minus">-</button></td>
			<td>${count}</td>
			<td><button class="cart-btn-plus">+</button></td>
			<td>${count * price}$</td>
			<td><button class="cart-btn-delete">x</button></td>
			`;
			cartTableGoods.append(trGood);
			
		});

		const totalPrice = this.cartGoods.reduce((sum ,item )=>{
			return sum + item.price * item.count;
		}, 0);

		cartTableTotal.textContent = totalPrice + '$';
	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter(item =>id !== item.id);
		this.count();
	},
	minusGood(id){
		for(const item of this.cartGoods){
			if(item.id === id){
				item.count--;
				if(item.count === 0){
					this.deleteGood(id);
				}
				break;
			}
		}
		this.count();
	},
	plusGood(id){
		for(const item of this.cartGoods){
			if(item.id === id){
				item.count++;
				break;
			}
		}
		this.renderCart();
	},
	addCartGoods(id){
		const goodItem = this.cartGoods.find(item => item.id ===id);
		if(goodItem){
			this.plusGood(id);
		}else{
			getGoods()
				.then(data => data.find(item => item.id === id))
					.then(({id, name, price}) =>{
						this.cartGoods.push({
							id,
							name,
							price,
							count: 1,
						});
					});
		}
	},
};

//cart modal
function openModal(){
	modalCart.classList.add('show');
	cart.renderCart();
}
function closeModal(e){
	modalCart.classList.remove('show');
}
btnCart.addEventListener('click', openModal);
//cart events
document.body.addEventListener('click', e =>{
	const addToCart = e.target.closest('.add-to-cart');
	if(addToCart){
		cart.addCartGoods(addToCart.dataset.id);
		cart.count();
		alert(`Товар был добавлен в корзину `);
	}
});
cartTableGoods.addEventListener('click',e =>{
	const target = e.target;
	if(target.classList.contains('cart-btn-delete')){
		const parent = target.closest('.cart-item');
		cart.deleteGood(parent.dataset.id);
		cart.count();
	}
	if(target.classList.contains('cart-btn-minus')){
		const parent = target.closest('.cart-item');
		cart.minusGood(parent.dataset.id);
	}
	if(target.classList.contains('cart-btn-plus')){
		const parent = target.closest('.cart-item');
		cart.plusGood(parent.dataset.id);
	}
});
modalClose.addEventListener('click', closeModal);

overlayClose.addEventListener('click',(e)=>{
	if(e.target.classList.contains('overlay')){
		closeModal();
	}
});
//cart count

//scroll smoot("think about"... sorry)

{
	const scrollLink = document.querySelectorAll('a.scroll-link');

scrollLink.forEach(link =>{
	link.addEventListener('click', (e)=>{
		e.preventDefault();
		const id = link.getAttribute('href');
		document.querySelector(id).scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	});
});
}


//catalogs

//Загружаю массив товаров с сервера
const getGoods = async function(){
	const result = await fetch('db/db.json');
	if(!result.ok){
		throw `Ошибка ${result.status}`;
	}
	return await result.json();
};

//check
/* getGoods().then(data=>{
 console.log(data);
}); */

//card create

const createCard = function(objCard){
	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';
	card.innerHTML = `
	<div class="goods-card">
		${objCard.label ?
		`<span class="label">${objCard.label}</span>` : ''}
		<img src="db/${objCard.img}" alt="${objCard.name}" class="goods-image">
		<h3 class="goods-title">${objCard.name}</h3>
		<p class="goods-description">${objCard.description}</p>
		<button class="button goods-card-btn add-to-cart" data-id="${objCard.id}">
			<span class="button-price">$${objCard.price}</span>
		</button>
	</div>
	`;

	return card;
};

const renderCards = function(data){
	longGoodsList.textContent = '';
	const cards = data.map(createCard);
	cards.forEach(card =>{
		longGoodsList.append(card);
	});
	document.body.classList.add('show-goods');
};

more.addEventListener('click', (e)=>{
	e.preventDefault();

	getGoods().then(renderCards);
	document.body.scrollIntoView({
		behavior: "smooth",
		block: "start",
	});
});

function filterCards(field, value){
		getGoods().then(data =>{
			return data.filter(good =>{
				return good[field] === value;
			});
		})
		.then(renderCards);
}

navigationLink.forEach(function (link){
	link.addEventListener('click', e =>{
		e.preventDefault();
		if(link.textContent == 'All'){
			return	getGoods().then(renderCards);
		}
		const field = link.dataset.field;
		const value = link.textContent;
		console.log(value);
		console.log(field);
		filterCards(field, value);
	});
});
btnPromo.forEach(btn =>{
	btn.addEventListener('click',function(e){
		const field = 'category';
		const value = btn.dataset.field;

		filterCards(field, value);
		document.body.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	});
});

// обеим кнопкам добавил класс promo и data-set