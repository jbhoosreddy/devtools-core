/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global jest */
const { shallow } = require("enzyme");
const {
  getRep,
} = require("../rep");
const GripArray = require("../grip-array");
const { MODE } = require("../constants");
const stubs = require("../stubs/grip-array");
const {
  expectActorAttribute,
  getSelectableInInspectorGrips,
} = require("./test-helpers");
const {maxLengthMap} = GripArray;

function shallowRenderRep(object, props = {}) {
  return shallow(GripArray.rep(Object.assign({
    object,
  }, props)));
}

describe("GripArray - basic", () => {
  const object = stubs.get("testBasic");

  it("correctly selects GripArray Rep", () => {
    expect(getRep(object)).toBe(GripArray.rep);
  });

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);
    const defaultOutput = "Array []";

    let component = renderRep({ mode: undefined });
    expect(component.text()).toBe(defaultOutput);
    expectActorAttribute(component, object.actor);

    component = renderRep({ mode: MODE.TINY });
    expect(component.text()).toBe("[]");
    expectActorAttribute(component, object.actor);

    component = renderRep({ mode: MODE.SHORT });
    expect(component.text()).toBe(defaultOutput);
    expectActorAttribute(component, object.actor);

    component = renderRep({ mode: MODE.LONG });
    expect(component.text()).toBe(defaultOutput);
    expectActorAttribute(component, object.actor);
  });
});

describe("GripArray - max props", () => {
  const object = stubs.get("testMaxProps");

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);

    const defaultOutput = `Array [ 1, "foo", {…} ]`;
    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(defaultOutput);

    // Check the custom title with nested objects to make sure nested objects are not
    // displayed with their parent's title.
    expect(renderRep({
      mode: MODE.LONG,
      title: "CustomTitle",
    }).text()).toBe(`CustomTitle [ 1, "foo", {…} ]`);
  });
});

describe("GripArray - more than short mode max props", () => {
  const object = stubs.get("testMoreThanShortMaxProps");

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);

    const shortLength = maxLengthMap.get(MODE.SHORT);
    const shortContent = Array(shortLength).fill('"test string"').join(", ");
    const longContent = Array(shortLength + 1).fill('"test string"').join(", ");
    const defaultOutput = `Array [ ${shortContent}, … ]`;

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(`Array [ ${longContent} ]`);
  });
});

describe("GripArray - more than long mode max props", () => {
  const object = stubs.get("testMoreThanLongMaxProps");

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);

    const shortLength = maxLengthMap.get(MODE.SHORT);
    const longLength = maxLengthMap.get(MODE.LONG);
    const shortContent = Array(shortLength).fill('"test string"').join(", ");
    const defaultOutput = `Array [ ${shortContent}, … ]`;
    const longContent = Array(longLength).fill('"test string"').join(", ");

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text())
      .toBe(`Array [ ${longContent}, … ]`);
  });
});

describe("GripArray - recursive array", () => {
  const object = stubs.get("testRecursiveArray");

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);

    const defaultOutput = `Array [ […] ]`;

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(defaultOutput);
  });
});

describe("GripArray - preview limit", () => {
  const object = stubs.get("testPreviewLimit");

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);

    const shortOutput = "Array [ 0, 1, 2, … ]";
    const longOutput = "Array [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, … ]";

    expect(renderRep({ mode: undefined }).text()).toBe(shortOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(shortOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(longOutput);
  });
});

describe("GripArray - empty slots", () => {
  it("renders an array with empty slots only as expected", () => {
    const object = stubs.get("Array(5)");
    const renderRep = (props) => shallowRenderRep(object, props);

    const defaultOutput = "Array [ <5 empty slots> ]";

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(defaultOutput);
  });

  it("renders array with one empty slot at the beginning as expected", () => {
    const object = stubs.get("[,1,2,3]");
    const renderRep = (props) => shallowRenderRep(object, props);

    const defaultOutput = "Array [ <1 empty slot>, 1, 2, … ]";
    const longOutput = "Array [ <1 empty slot>, 1, 2, 3 ]";

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(longOutput);
  });

  it("renders array with multiple consecutive empty slots at the beginning as expected",
    () => {
      const object = stubs.get("[,,,3,4,5]");
      const renderRep = (props) => shallowRenderRep(object, props);

      const defaultOutput = "Array [ <3 empty slots>, 3, 4, … ]";
      const longOutput = "Array [ <3 empty slots>, 3, 4, 5 ]";

      expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
      expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
      expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
      expect(renderRep({ mode: MODE.LONG }).text()).toBe(longOutput);
    }
  );

  it("renders array with one empty slot in the middle as expected", () => {
    const object = stubs.get("[0,1,,3,4,5]");
    const renderRep = (props) => shallowRenderRep(object, props);

    const defaultOutput = "Array [ 0, 1, <1 empty slot>, … ]";
    const longOutput = "Array [ 0, 1, <1 empty slot>, 3, 4, 5 ]";

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(longOutput);
  });

  it("renders array with successive empty slots in the middle as expected", () => {
    const object = stubs.get("[0,1,,,,5]");
    const renderRep = (props) => shallowRenderRep(object, props);

    const defaultOutput = "Array [ 0, 1, <3 empty slots>, … ]";
    const longOutput = "Array [ 0, 1, <3 empty slots>, 5 ]";

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(longOutput);
  });

  it("renders array with non successive single empty slots as expected", () => {
    const object = stubs.get("[0,,2,,4,5]");
    const renderRep = (props) => shallowRenderRep(object, props);

    const defaultOutput = "Array [ 0, <1 empty slot>, 2, … ]";
    const longOutput = "Array [ 0, <1 empty slot>, 2, <1 empty slot>, 4, 5 ]";

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(longOutput);
  });

  it("renders array with multiple multi-slot holes as expected", () => {
    const object = stubs.get("[0,,,3,,,,7,8]");
    const renderRep = (props) => shallowRenderRep(object, props);

    const defaultOutput = "Array [ 0, <2 empty slots>, 3, … ]";
    const longOutput = "Array [ 0, <2 empty slots>, 3, <3 empty slots>, 7, 8 ]";

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(longOutput);
  });

  it("renders array with a single slot hole at the end as expected", () => {
    const object = stubs.get("[0,1,2,3,4,,]");
    const renderRep = (props) => shallowRenderRep(object, props);

    const defaultOutput = "Array [ 0, 1, 2, … ]";
    const longOutput = "Array [ 0, 1, 2, 3, 4, <1 empty slot> ]";

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(longOutput);
  });

  it("renders array with multiple consecutive empty slots at the end as expected", () => {
    const object = stubs.get("[0,1,2,,,,]");
    const renderRep = (props) => shallowRenderRep(object, props);

    const defaultOutput = "Array [ 0, 1, 2, … ]";
    const longOutput = "Array [ 0, 1, 2, <3 empty slots> ]";

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(longOutput);
  });
});

describe("GripArray - NamedNodeMap", () => {
  const object = stubs.get("testNamedNodeMap");

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);

    const defaultOutput = 'NamedNodeMap [ class="myclass", cellpadding="7", border="3" ]';

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(defaultOutput);
  });
});

describe("GripArray - NodeList", () => {
  const object = stubs.get("testNodeList");
  const grips = getSelectableInInspectorGrips(object);
  const renderRep = (props) => shallowRenderRep(object, props);

  it("renders as expected", () => {
    const defaultOutput = "NodeList [ button#btn-1.btn.btn-log, " +
      "button#btn-2.btn.btn-err, button#btn-3.btn.btn-count ]";

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(defaultOutput);
  });

  it("has 3 node grip", () => {
    expect(grips.length).toBe(3);
  });

  it("calls the expected function on mouseover", () => {
    const onDOMNodeMouseOver = jest.fn();
    const wrapper = renderRep({ onDOMNodeMouseOver });
    const node = wrapper.find(".objectBox-node");

    node.at(0).simulate("mouseover");
    node.at(1).simulate("mouseover");
    node.at(2).simulate("mouseover");

    expect(onDOMNodeMouseOver.mock.calls.length).toBe(3);
    expect(onDOMNodeMouseOver.mock.calls[0][0]).toBe(grips[0]);
    expect(onDOMNodeMouseOver.mock.calls[1][0]).toBe(grips[1]);
    expect(onDOMNodeMouseOver.mock.calls[2][0]).toBe(grips[2]);
  });

  it("calls the expected function on mouseout", () => {
    const onDOMNodeMouseOut = jest.fn();
    const wrapper = renderRep({ onDOMNodeMouseOut });
    const node = wrapper.find(".objectBox-node");

    node.at(0).simulate("mouseout");
    node.at(1).simulate("mouseout");
    node.at(2).simulate("mouseout");

    expect(onDOMNodeMouseOut.mock.calls.length).toBe(3);
  });

  it("calls the expected function on click", () => {
    const onInspectIconClick = jest.fn();
    const wrapper = renderRep({ onInspectIconClick });
    const node = wrapper.find(".open-inspector");

    node.at(0).simulate("click");
    node.at(1).simulate("click");
    node.at(2).simulate("click");

    expect(onInspectIconClick.mock.calls.length).toBe(3);
    expect(onInspectIconClick.mock.calls[0][0]).toBe(grips[0]);
    expect(onInspectIconClick.mock.calls[1][0]).toBe(grips[1]);
    expect(onInspectIconClick.mock.calls[2][0]).toBe(grips[2]);
  });

  it("renders no inspect icon when nodes are not connected to the DOM tree", () => {
    const renderedComponentWithoutInspectIcon = shallowRenderRep(
      stubs.get("testDisconnectedNodeList")
    );
    const node = renderedComponentWithoutInspectIcon.find(".open-inspector");
    expect(node.exists()).toBe(false);
  });
});

describe("GripArray - DocumentFragment", () => {
  const object = stubs.get("testDocumentFragment");

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);

    const defaultOutput = "DocumentFragment [ li#li-0.list-element, " +
      "li#li-1.list-element, li#li-2.list-element, … ]";
    const longOutput = "DocumentFragment [ " +
      "li#li-0.list-element, li#li-1.list-element, li#li-2.list-element, " +
      "li#li-3.list-element, li#li-4.list-element ]";

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.TINY }).text()).toBe("[…]");
    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(longOutput);
  });
});

describe("GripArray - Items not in preview", () => {
  const object = stubs.get("testItemsNotInPreview");

  it("correctly selects GripArray Rep", () => {
    expect(getRep(object)).toBe(GripArray.rep);
  });

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);
    const defaultOutput = "Array [ … ]";

    let component = renderRep({ mode: undefined });
    expect(component.text()).toBe(defaultOutput);
    expectActorAttribute(component, object.actor);

    component = renderRep({ mode: MODE.TINY });
    expect(component.text()).toBe("[…]");
    expectActorAttribute(component, object.actor);

    component = renderRep({ mode: MODE.SHORT });
    expect(component.text()).toBe(defaultOutput);
    expectActorAttribute(component, object.actor);

    component = renderRep({ mode: MODE.LONG });
    expect(component.text()).toBe(defaultOutput);
    expectActorAttribute(component, object.actor);
  });
});
