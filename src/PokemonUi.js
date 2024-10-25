import { LitElement, html } from 'lit-element';
import { getComponentSharedStyles } from '@bbva-web-components/bbva-core-lit-helpers';
import styles from './pokemon-ui.css.js';
//import '@bbva-experience-components/bbva-type-text/bbva-type-text.js'
//import '@bbva-experience-components/bbva-button-default/bbva-button-default.js';
import '@bbva-web-components/bbva-foundations-grid-default-layout/bbva-foundations-grid-default-layout.js';

export class PokemonUi extends LitElement {
  static get properties() {
    return {     
      name: {type: String,},
      pokemons: {type: Array,},
    };
  }

  constructor() {
    super();
    this.name = 'Cells';
    this.pokemons = [];
  }

  static get styles() {
    return [
      styles,
      getComponentSharedStyles('pokemon-ui-shared-styles'),
    ];
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchPokemons();
  }

  async fetchPokemons() {
    const promise = [];
    for (let i = 1; i <= 20; i++) {
      promise.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res=>res.json()));
    }
    const pokemonData = await Promise.all(promise);
    this.pokemons = await Promise.all(pokemonData.map(pokemon => this.fetchEvolution(pokemon)));
  }

  async fetchEvolution(pokemon) {
    const evolutionChainUrl = pokemon.species.url;
    const speciesResponse = await fetch (evolutionChainUrl);
    const speciesData = await speciesResponse.json();
    const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
    const evolutionChainData = await evolutionChainResponse.json();
    const evolutions = this.getEvolution(evolutionChainData.chain);
    return{
      ...pokemon,
      evolutions,
      imageUrl: pokemon.sprites.front_default,
    };
  }

  getEvolution(chain){
    const evolutions = [];
    let current = chain;
    while (current){
      evolutions.push({
        name: current.species.name,
        url:  `https://pokeapi.co/api/v2/pokemon/${current.species.url.split('/')[6]}/`,
      });
      current = current.evolves_to[0];
    }
    return evolutions;    
  }

  render() {
    return html`
      <h1>Welcome to Pokedex</h1>
      <div class="container">
       <bbva-foundations-grid-default-layout>
        <div class="element" slot="single">
          ${this.pokemons.map(pokemon => html`            
              <img src="${pokemon.imageUrl}" alt="${pokemon.name}"/>
                          <p>${pokemon.name}</p>
                          <p>${pokemon.habilities}</p>            
          `)}
        </div>  
       </bbva-foundations-grid-default-layout>
      </div>  
    `;
  }
}
