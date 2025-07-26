Instructions and Rules for Building a Modular Codebase
These instructions and rules ensure the codebase is modular, loosely coupled, and maintainable, allowing features to be added, modified, or removed without affecting other parts of the system. Follow these guidelines strictly when generating or modifying code.
1. General Principles

Separation of Concerns: Each module, class, or function must handle a single responsibility (e.g., data fetching, UI rendering, or business logic).
Loose Coupling: Modules must interact through well-defined interfaces, events, or APIs, not direct manipulation of internal logic.
High Cohesion: Group related functionality within a single module to improve clarity and maintainability.
Encapsulation: Hide implementation details, exposing only necessary methods or APIs.
Single Responsibility Principle (SRP): Ensure each module or class has only one reason to change.
Reusability: Design modules to be reusable across the application or other projects.

2. Project Structure

Use a Feature-Based Structure: Organize code by features, not types. Each feature should have its own directory containing all related components, services, and state logic.

Example:
src/
  features/
    auth/
      components/
        Login.js
        Register.js
      services/
        authService.js
      authReducer.js
    cart/
      components/
        Cart.js
      services/
        cartService.js
      cartReducer.js
  shared/
    components/
      Button.js
    utils/
      api.js




Centralize Shared Logic: Place reusable utilities, components, or helpers in a shared/ directory.

Avoid Cross-Feature Dependencies: Features should not directly import or modify each other’s internal code. Use interfaces or events for communication.


3. Dependency Management

Use Dependency Injection (DI): Pass dependencies (e.g., services, APIs) to modules via constructors or configuration, not hardcoding.

Example (TypeScript):
interface UserService {
  getUser(id: string): Promise<User>;
}
class AuthController {
  constructor(private userService: UserService) {}
  async login(userId: string) {
    return await this.userService.getUser(userId);
  }
}




Avoid Global Variables: Do not use global state or variables for feature-specific logic. Use module-specific state or context.

Use Configuration Files: Store feature configurations (e.g., API endpoints, settings) in separate config files to allow easy updates without changing code.


4. Inter-Module Communication

Define Interfaces: Create clear interfaces or contracts for module interactions.

Example (TypeScript):
interface PaymentProcessor {
  processPayment(amount: number): Promise<boolean>;
}
class StripeProcessor implements PaymentProcessor {
  async processPayment(amount: number) {
    // Stripe logic
    return true;
  }
}




Use Event-Driven Communication: Prefer events or a pub/sub system for loose coupling between features.

Example (JavaScript):
const EventEmitter = require("events");
const eventBus = new EventEmitter();
// In cartService.js
eventBus.emit("itemAdded", { itemId: "123" });
// In notificationService.js
eventBus.on("itemAdded", (data) => {
  console.log(`Notification: Item ${data.itemId} added`);
});




Standardize APIs: Use RESTful APIs, GraphQL, or internal function calls with clear input/output contracts for feature interactions.


5. State Management

Isolate Feature State: Each feature should manage its own state using a dedicated store, reducer, or context.

Example (Redux Toolkit):
// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authReducer";
import cartReducer from "../features/cart/cartReducer";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});




Avoid Shared State for Features: Do not store feature-specific data in a global store unless it’s truly shared (e.g., user session).

Use Immutable State: Ensure state updates are immutable to prevent unintended side effects.


6. Adding and Removing Features

Modular Feature Integration:

Create a new feature directory under features/ with all necessary components, services, and state logic.
Register the feature in the app (e.g., add its reducer to the store or route to the router).
Use events or interfaces to connect the feature to other parts of the system.


Safe Removal:

Ensure features can be removed by deleting their directory and unregistering them (e.g., removing from store or router).
Avoid hard dependencies in other features to prevent breakage.


Plugin System (Optional):

Implement a plugin registry for dynamic feature addition/removal.

Example (JavaScript):
const plugins = {};
export function registerPlugin(name, plugin) {
  plugins[name] = plugin;
}
export function runPlugin(name, data) {
  if (plugins[name]) plugins[name].execute(data);
}





7. Code Quality and Testing

Encapsulate Logic: Expose only public methods or APIs. Keep internal functions private.

Write Unit Tests: Test each feature in isolation to ensure it doesn’t affect others.

Example (Jest):
describe("CartService", () => {
  test("should add item without affecting auth", async () => {
    const cartService = new CartService();
    await cartService.addToCart("item1");
    expect(cartService.getItems()).toContain("item1");
  });
});




Run Integration Tests: Test feature interactions to catch unintended side effects.

Use Linters and Formatters: Enforce consistent code style (e.g., ESLint, Prettier) to maintain readability.


8. Error Handling and Robustness

Handle Edge Cases: Each module must handle its own errors (e.g., API failures, invalid inputs).
Log Errors Locally: Log errors within the feature, not globally, unless they affect the entire system.
Graceful Degradation: Ensure the system remains functional if a feature fails or is removed.

9. Documentation

Document Each Feature:

Include a README in each feature directory explaining its purpose, dependencies, and APIs.

Example:
# Wishlist Feature
## Purpose
Manages user wishlists for products.
## Dependencies
- ProductService (for fetching product details)
- EventBus (for emitting wishlist updates)
## APIs
- addItem(itemId: string): Adds an item to the wishlist.
- removeItem(itemId: string): Removes an item.




Document Interfaces: Clearly define inputs, outputs, and behavior for all public APIs.

Update Documentation: When modifying a feature, update its documentation to reflect changes.


10. Specific Instructions for AI Systems

Generate Modular Code: Always structure generated code in a feature-based directory layout.
Avoid Hardcoding Dependencies: Use dependency injection or configuration files for flexibility.
Check for Side Effects: Before generating or modifying code, verify it won’t affect existing features by analyzing dependencies.
Suggest Interfaces: When adding a new feature, propose an interface or event-based integration to maintain loose coupling.
Test Proposals: Generate unit tests for new or modified features to ensure isolation.
Refactor on Request: If asked to modify a feature, update only the relevant module and preserve existing functionality.
Validate Changes: Before applying changes, confirm they align with these rules and don’t introduce tight coupling or side effects.

11. Adding a New Feature (Step-by-Step)

Define the Feature:
Write a clear specification (e.g., “Add a wishlist feature to save and view items”).
Identify inputs, outputs, and dependencies.


Create a Feature Directory:
Add a new folder under features/ (e.g., wishlist/).
Include components, services, and state logic.


Implement Interfaces or Events:
Define how the feature interacts with others (e.g., via an interface or event bus).


Register the Feature:
Add to the app’s store, router, or plugin system as needed.


Test the Feature:
Write unit tests to verify functionality in isolation.
Run existing tests to ensure no regressions.


Document the Feature:
Add a README with purpose, APIs, and dependencies.



12. Removing a Feature

Delete the feature’s directory (e.g., features/wishlist/).
Unregister the feature from the store, router, or plugin system.
Verify no other features depend on it directly (use interfaces or events to avoid this).
Run all tests to confirm the system remains stable.

13. Example: Adding a Wishlist Feature

Directory:
src/features/wishlist/
  components/
    Wishlist.js
  services/
    wishlistService.js
  wishlistReducer.js


Service with Interface:
interface WishlistService {
  addItem(itemId: string): Promise<void>;
  getItems(): Promise<string[]>;
}
class ApiWishlistService implements WishlistService {
  async addItem(itemId: string) {
    // API call
    eventBus.emit("wishlistUpdated", { itemId });
  }
  async getItems() {
    return ["item1", "item2"];
  }
}


Register in Store:
import wishlistReducer from "../features/wishlist/wishlistReducer";
export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
  },
});


Test:
describe("WishlistService", () => {
  test("should add item", async () => {
    const wishlistService = new ApiWishlistService();
    await wishlistService.addItem("item1");
    expect(await wishlistService.getItems()).toContain("item1");
  });
});



14. Tools and Technologies

Languages/Frameworks: Use modular frameworks like React, Vue, Angular, NestJS, Django, or Spring.
State Management: Use Redux Toolkit, Zustand, Pinia, or Vuex for frontend state.
Event Systems: Use EventEmitter (Node.js), RxJS, or message brokers (e.g., RabbitMQ).
Testing: Use Jest, Mocha, JUnit, or pytest for unit and integration tests.
Bundlers: Use Webpack, Vite, or Rollup for frontend module management.
Monorepos: Consider Nx or Lerna for large projects with multiple features.

15. Validation Checklist
Before generating or modifying code:

 
Is the code organized in a feature-based structure?

 
Are dependencies injected or configured, not hardcoded?

 
Does the feature use interfaces or events for communication?

 
Is the feature’s state isolated?

 
Are unit tests included to verify isolation?

 
Is documentation provided for the feature?

 
Does the change avoid introducing side effects or tight coupling?


By following these rules, the codebase will remain modular, allowing features to be added or removed with minimal impact on existing functionality.