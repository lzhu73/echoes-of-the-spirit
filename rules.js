class Start extends Scene {
    create() {
        this.engine.inventory = [];
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.addChoice("Begin your journey");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
    }
}

class Location extends Scene {
    create(key) {
        this.key = key;
        const locationData = this.engine.storyData.Locations[key];

        if (locationData.Scene && Engine.sceneMap?.[locationData.Scene]) {
            const SceneClass = Engine.sceneMap[locationData.Scene];
            this.engine.gotoScene(SceneClass);
            return;
        }

        this.engine.show(locationData.Body);

        //add item if not already in inventory
        if (locationData.Item && !this.engine.inventory.includes(locationData.Item)) {
            this.engine.inventory.push(locationData.Item);
            this.engine.show(`<p><em>You obtained: ${locationData.Item}</em></p>`);
        }

        //show choices
        if (locationData.Choices && locationData.Choices.length > 0) {
            for (let choice of locationData.Choices) {
                if (!choice.Requires || this.engine.inventory.includes(choice.Requires)) {
                    this.engine.addChoice(choice.Text, choice);
                }
            }
        } else {
            this.engine.addChoice("The end.");
        }

        this.engine.addChoice("Check your inventory", { special: "inventory", ReturnHere: key });
    }

    handleChoice(choice) {
        if (choice && choice.special === "inventory") {
            const items = this.engine.inventory.length > 0
                ? this.engine.inventory.join(", ")
                : "You are not carrying anything.";
            this.engine.show(`<p><strong>Your Inventory:</strong> ${items}</p>`);
            this.engine.gotoScene(Location, choice.ReturnHere);
            return;
        }

        if (choice) {
            this.engine.show("&gt; " + choice.Text);

            //if have item, use it
            if (choice.Requires && choice.Consumes) {
                const idx = this.engine.inventory.indexOf(choice.Requires);
                if (idx !== -1) {
                    this.engine.inventory.splice(idx, 1);
                    this.engine.show(`<p><em>You used: ${choice.Requires}</em></p>`);
                }
            }

            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}


class SpiritMirror extends Scene {
    create() {
        const inv = this.engine.inventory;
        this.engine.show("You gaze into the Spirit Mirror...");

        if (inv.includes("Celestial Core")) {
            this.engine.show("The mirror glows intensely, revealing a hidden path beyond the veil.");
            this.engine.addChoice("Step into the Fantasy Grove", { Target: "Fantasy Grove" });
        } else {
            this.engine.show("The mirror reflects only a misty void. Something seems to be missing...");
        }

        this.engine.addChoice("Return to the cliff", { Target: "Cliffside Ruin" });
    }

    handleChoice(choice) {
        if (choice && choice.Target) {
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(Location, "Cliffside Ruin");
        }
    }
}


class TransformationAltar extends Scene {
    create() {
        const inv = this.engine.inventory;
        this.engine.show("You kneel at the altar. Runes awaken as you draw near...");

        if (inv.includes("World Shard Seed")) {
            this.engine.show("The World Shard Seed is accepted. The altar grants you its blessing.");
            //remove seed
            const idx = inv.indexOf("World Shard Seed");
            if (idx !== -1) inv.splice(idx, 1);

            //add Celestial Core
            this.engine.inventory.push("Celestial Core");
            this.engine.show("<p><em>You received: Celestial Core</em></p>");

            this.engine.addChoice("Continue your journey", { Target: "Floating Marketplace" });
        } else {
            this.engine.show("The altar remains dormant. You lack the seed it requires.");
            this.engine.addChoice("Return quietly", { Target: "Floating Marketplace" });
        }
    }

    handleChoice(choice) {
        if (choice && choice.Target) {
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(Location, "Floating Marketplace");
        }
    }
}

class RiddleGate extends Scene {
    create() {
        this.engine.show("The stone gate rumbles. A voice echoes in your mind:");
        this.engine.show("<em>\"I have roots, but no branches. I hide secrets, but grow no leaves. I am the foundation, yet unseen. What am I?\"</em>");

        this.engine.addChoice("A mirror", { wrong: true });
        this.engine.addChoice("A tree", { wrong: true });
        this.engine.addChoice("The soul", { wrong: true });
        this.engine.addChoice("The spirit vein", { correct: true });
    }

    handleChoice(choice) {
        if (choice.correct) {
            this.engine.show("<p>You feel a moment of clarity… but the gate has its own will.</p>");
        } else {
            this.engine.show("<p>The stone shivers with amusement. It doesn't care what you think.</p>");
        }

        const destinations = [
            "Frosted Peak",
            "Fantasy Grove",
            "Mirror Realm",
            "Floating Marketplace",
            "Withered Garden"
        ];
        const randomIndex = Math.floor(Math.random() * destinations.length);
        const randomTarget = destinations[randomIndex];

        this.engine.show("<p>The ground shifts beneath you...</p>");
        this.engine.gotoScene(Location, randomTarget);
    }
}


class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.sceneMap = {
    SpiritMirror: SpiritMirror,
    TransformationAltar: TransformationAltar,
    RiddleGate: RiddleGate
};

// Load story
Engine.load(Start, 'myStory.json');

