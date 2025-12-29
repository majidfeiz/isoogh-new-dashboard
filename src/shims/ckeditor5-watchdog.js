// Minimal stub for CKEditor 5 watchdog to satisfy ckeditor5-react in build/runtime.
// Provides EditorWatchdog and ContextWatchdog with the minimal API used by the wrapper.

class EditorWatchdog {
  constructor(editorClass) {
    this.EditorClass = editorClass;
    this._creator = null;
    this._editor = null;
  }

  setCreator(fn) {
    this._creator = fn;
  }

  async create(element, config) {
    if (this._creator) {
      this._editor = await this._creator(element, config);
      return this._editor;
    }

    if (this.EditorClass?.create) {
      this._editor = await this.EditorClass.create(element, config);
      return this._editor;
    }

    throw new Error("EditorWatchdog: no creator available");
  }

  on() {
    // no-op: watchdog events ignored in stub
  }

  async destroy() {
    if (this._editor?.destroy) {
      await this._editor.destroy();
    }
    this._editor = null;
  }

  get editor() {
    return this._editor || null;
  }
}

class ContextWatchdog {
  constructor(contextClass) {
    this.ContextClass = contextClass;
    this._context = null;
  }

  async create(config) {
    if (this.ContextClass?.create) {
      this._context = await this.ContextClass.create(config);
    }
    return this._context;
  }

  on() {
    // no-op
  }

  async destroy() {
    if (this._context?.destroy) {
      await this._context.destroy();
    }
    this._context = null;
  }

  get context() {
    return this._context || null;
  }

  get state() {
    return this._context ? "ready" : "destroyed";
  }
}

export { EditorWatchdog, ContextWatchdog };
