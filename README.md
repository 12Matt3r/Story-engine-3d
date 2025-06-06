# Narrative Engine - Interactive Storytelling

This project is a 3D narrative game experience built with Three.js. It allows players to immerse themselves in an evolving story where their choices and interactions shape the narrative.

**Play it now on websim.ai:** [Narrative Engine](https://websim.com/@SOFAKINGSADBOI/narrative-engine-interactive-storytelling/10)

## Core Gameplay & Features

*   **Interactive Narrative:** Engage with a story that unfolds based on your actions and decisions.
*   **Decision Making:** Make choices that influence the direction of the story and your character's path.
*   **Player Archetypes:** Select an archetype that can affect how the story progresses and how your character perceives the world.
*   **Dynamic Environment:** Experience a 3D world that can change and react to story events.
*   **Environmental Storytelling:** Discover narrative elements embedded within the game environment.

## Key Technologies

*   **Three.js:** For 3D graphics rendering and world creation.
*   **JavaScript (ES6 Modules):** For game logic, story engine, UI management, and interactions.

## Project Structure

The project is organized into several JavaScript modules:

*   `game.js`: Main game loop, initializes and manages all game systems.
*   `story-engine.js`: Handles the narrative progression, player data, and story logic.
*   `ui.js`: Manages the user interface elements, including text display and decision buttons.
*   `world-builder.js`: Responsible for creating the 3D game world and its objects.
*   `controls.js`: Manages player movement and camera controls.
*   `interaction-system.js`: Handles player interactions with objects in the game world.
*   `environmental-storytelling.js`: Implements systems for conveying narrative through the environment.
*   `narrative-templates.js`: Contains templates for story segments and events.
*   `index.html`: The main entry point for the web application.
*   `style.css`: Defines the visual styling for the UI elements.

## How to Run

1.  Clone or download this repository.
2.  Open the `index.html` file in a modern web browser that supports ES6 modules and WebGL.
    *   For local development, it's often best to serve the files using a local web server to avoid potential issues with file path loading (e.g., using Python's `http.server` or a VS Code Live Server extension).

## Future Enhancements

*   Expanded narrative content and branching storylines.
*   More complex environmental interactions and puzzles.
*   Enhanced character development and impact of archetypes.
*   Persistence of player progress.
*   More sophisticated narrator behaviors and personalities.

## Contributing

Contributions are welcome! If you have ideas for improvements or new features, please feel free to fork the repository and submit a pull request.

## License

This project is open source and available under the [MIT License](LICENSE.md). (Assuming MIT, a LICENSE.md file would need to be created if one doesn't exist).
