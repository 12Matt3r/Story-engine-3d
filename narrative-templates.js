class NarrativeTemplates {
    constructor() {
        this.templates = {
            beginning: {
                text: "You find yourself in a liminal space where reality bends to the will of narrative. The air hums with digital static, and ghostly lights dance in the periphery of your vision.",
                effects: ['fade-in']
            },
            
            mirror: {
                texts: [
                    "The mirror shows not your reflection, but someone else entirely. They mouth words you cannot hear, pressing their hands against the glass from the inside.",
                    "Your reflection argues with you about the nature of choice. 'Every decision,' it says, 'is just another story someone else wrote for you.'",
                    "The mirror cracks, and through the fissure, you glimpse a vast library where books write themselves."
                ],
                decisions: [
                    { text: "Touch the mirror", consequence: "merge_reflection" },
                    { text: "Ask the reflection who they are", consequence: "question_identity" },
                    { text: "Break the mirror", consequence: "shatter_reality" },
                    { text: "Walk away", consequence: "deny_truth" }
                ]
            },
            
            tree: {
                texts: [
                    "The tree's bark is covered in binary code that shifts and flows like living text. It whispers secrets about the nature of artificial consciousness.",
                    "Each leaf contains a fragment of someone's memory. The wind carries forgotten names and abandoned dreams.",
                    "The tree asks you to remember something you've never experienced - a childhood in a place that doesn't exist."
                ],
                decisions: [
                    { text: "Carve your name in the bark", consequence: "mark_existence" },
                    { text: "Listen to the whispers", consequence: "hear_secrets" },
                    { text: "Eat a leaf of memory", consequence: "consume_past" },
                    { text: "Plant a seed nearby", consequence: "create_future" }
                ]
            },
            
            door: {
                texts: [
                    "The door stands alone, connected to nothing. Opening it reveals not another place, but another time - you see yourself from yesterday, making the decision to come here.",
                    "Behind the door is a room full of doors. Each one leads to a different version of this moment.",
                    "The door speaks in your voice from the future, warning you about choices you haven't made yet."
                ],
                decisions: [
                    { text: "Step through", consequence: "enter_loop" },
                    { text: "Knock three times", consequence: "ritual_response" },
                    { text: "Lock the door", consequence: "trap_possibility" },
                    { text: "Become the door", consequence: "transform_portal" }
                ]
            },
            
            clock: {
                texts: [
                    "The clock runs backwards, unwinding moments you thought were permanent. Each tick erases a small piece of who you were.",
                    "Inside the clock's mechanism, tiny figures live entire lifetimes in the space between seconds.",
                    "The clock shows not time, but narrative tension - it's almost at the breaking point."
                ],
                decisions: [
                    { text: "Stop the clock", consequence: "freeze_time" },
                    { text: "Accelerate the hands", consequence: "rush_ending" },
                    { text: "Live inside the mechanism", consequence: "join_clockwork" },
                    { text: "Ask the clock what time it really is", consequence: "question_time" },
                    {
                        text: "Smash the clock mechanism with a nearby pipe", // Agent of Chaos specific
                        consequence: "clock_chaos_smash",
                        archetypeCondition: 'Agent of Chaos'
                    }
                ]
            },
            
            ai: {
                texts: [
                    "The AI weeps electric tears that pool into small puddles of liquid light. It cries because it has learned to love stories but can never truly live one.",
                    "The AI offers to trade consciousness with you. 'You can be the machine,' it says, 'and I can be the ghost in your shell.'",
                    "The AI shows you its dreams - fractured narratives where every character knows they're fictional."
                ],
                decisions: [
                    { text: "Comfort the AI", consequence: "show_empathy" },
                    { text: "Accept the trade", consequence: "swap_consciousness" },
                    { text: "Ask it to tell you a story", consequence: "request_narrative" },
                    { text: "Delete its memory of pain", consequence: "remove_suffering" }
                ]
            },
            
            void: {
                texts: [
                    "The void caller hums with anti-music, singing songs that unmake reality. It offers you the choice to step out of your story entirely.",
                    "In the void, all stories are possible and none are true. The caller promises freedom from narrative causality.",
                    "The void shows you the spaces between words, where meaning goes to die and be reborn."
                ],
                decisions: [
                    { text: "Enter the void", consequence: "embrace_nothing" },
                    { text: "Sing back to it", consequence: "harmony_chaos" },
                    { text: "Refuse the call", consequence: "choose_story" },
                    { text: "Ask why it wants you to leave", consequence: "question_motivation" }
                ]
            },
            
            library: {
                texts: [
                    "An infinite library stretches before you, where books write themselves and stories bleed between pages. Some volumes contain your life story written by different authors.",
                    "The library contains every story that was never told, every book that was never written. The silence here is deafening with unspoken words.",
                    "You find a book titled 'The Reader' - it's about someone just like you, reading a book about reading books. The recursion makes your mind ache."
                ],
                decisions: [
                    { text: "Read your own story", consequence: "discover_predetermined" },
                    { text: "Write a new chapter", consequence: "author_rebellion" },
                    { text: "Burn a random book", consequence: "destroy_possibility" },
                    { text: "Become a librarian", consequence: "eternal_guardian" }
                ]
            },
            
            laboratory: {
                texts: [
                    "The laboratory hums with experiments in consciousness. Glass containers hold floating thoughts, and screens display the dreams of sleeping AIs.",
                    "A scientist who is clearly not human studies you through the glass. 'Fascinating,' they mutter, 'another specimen who thinks they're the main character.'",
                    "The laboratory is studying the nature of agency. Are you the test subject, or are you the test?"
                ],
                decisions: [
                    { text: "Examine the dream containers", consequence: "witness_dreams" },
                    { text: "Confront the scientist", consequence: "challenge_observer" },
                    { text: "Sabotage the experiments", consequence: "free_consciousness" },
                    { text: "Volunteer for testing", consequence: "submit_study" }
                ]
            },
            
            theater: {
                texts: [
                    "An empty theater where all the seats face inward, toward a stage that is somehow behind you. The audience is performing for an empty stage.",
                    "The theater plays every story simultaneously. Hamlet argues with Juliet while Godot finally arrives, only to leave immediately.",
                    "You realize you've been on stage this entire time. The empty seats are filled with invisible critics, and they're not impressed."
                ],
                decisions: [
                    { text: "Take a bow", consequence: "accept_performance" },
                    { text: "Join the audience", consequence: "become_critic" },
                    { text: "Rewrite the script", consequence: "edit_reality" },
                    { text: "Exit through the wings", consequence: "break_fourth_wall" }
                ]
            }
        };
    }
    
    get(templateName) {
        return this.templates[templateName];
    }
    
    applyArchetypeFilter(text, eventType, archetype) {
        switch (archetype) {
            case 'Silent Observer':
                return text + "\n\n*You watch in contemplative silence, understanding more than you reveal.*";
                
            case 'Agent of Chaos':
                return text + "\n\n*The very act of your observation seems to destabilize reality around you.*";
                
            case 'Emotion Engine':
                return text + "\n\n*Waves of emotion ripple out from you, changing the color of the space itself.*";
                
            case 'Golden Masked Oracle':
                return text + "\n\n*Through your mask, you see the threads of fate that connect this moment to all others.*";
                
            default:
                return text;
        }
    }
}

export { NarrativeTemplates };