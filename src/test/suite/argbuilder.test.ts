import * as assert from "assert";

import * as vscode from "vscode";

import { buildArgsFromDomainTypePath } from "../../helpers";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as myExtension from '../../extension';

suite("buildArgsFromDomainTypePath Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Single Nested", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
  test("Double Nested", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
});
