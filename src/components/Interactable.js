import { Component } from '../ecs/Component.js';

export class Interactable extends Component {
  /**
   * @param {{
   *   storyType: string,
   *   title: string,
   *   triggered?: boolean
   * }} opts
   */
  constructor({ storyType, title, triggered = false }) {
    super();
    this.storyType = storyType;
    this.title = title;
    this.triggered = triggered;
  }

  toJSON() {
    return {
      storyType: this.storyType,
      title: this.title,
      triggered: this.triggered,
    };
  }

  static fromJSON({ storyType, title, triggered }) {
    return new Interactable({ storyType, title, triggered });
  }
}
