import React from "react";
import _, { matches, max } from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import {
  Close,
  KeyboardArrowDown,
  KeyboardArrowUp,
  ToggleOn,
  Tune,
} from "@mui/icons-material";
const ResponsiveReactGridLayout = WidthProvider(Responsive);
import ValidLayouts from "./layouts.json";
import { TextField, Tooltip } from "@mui/material";

class ToolBoxItem extends React.Component {
  render() {
    return (
      <div
        className="toolbox__items__item"
        onClick={this.props.onTakeItem.bind(undefined, this.props.item)}
      >
        {this.props.item.i}
      </div>
    );
  }
}
class ToolBox extends React.Component {
  render() {
    return (
      <div className="toolbox">
        <span className="toolbox__title">Toolbox</span>
        <div className="toolbox__items">
          {this.props.items.map((item) => (
            <ToolBoxItem
              key={item.i}
              item={item}
              onTakeItem={this.props.onTakeItem}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default class ToolboxLayout extends React.Component {
  static defaultProps = {
    className: "layout",
    rowHeight: 85,
    onLayoutChange: function () {},
    cols: { lg: 2, md: 2, sm: 2, xs: 2, xxs: 2 },
    initialLayout: generateLayout(),
  };

  state = {
    currentBreakpoint: "lg",
    compactType: "vertical",
    mounted: false,
    layouts: { lg: this.props.initialLayout },
    toolbox: { lg: [] },
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  componentDidUpdate(prevProps, prevState) {
    //Determine layout match
    if (prevState.layouts.lg !== this.state.layouts.lg) {
      const SELECTED_LAYOUT = ValidLayouts.findIndex((layout) => {
        return (
          layout.length ===
          layout.filter((button) =>
            this.state.layouts.lg.find(
              (i) =>
                i.x === button.x &&
                i.y === button.y &&
                i.h === button.h &&
                i.w === button.w
            )
          ).length
        );
      });
      this.setState({ selectedLayout: SELECTED_LAYOUT });
    }
  }

  generateDOM() {
    return _.map(this.state.layouts.lg, (l) => {
      const type =
        this.state.selectedLayout > -1
          ? ValidLayouts[this.state.selectedLayout].find(
              (i) => i.x === l.x && i.y === l.y && i.w === l.w && l.h === i.h
            )?.type || ""
          : "";
      return (
        <div
          key={l.i}
          style={{
            background: "#acaeae",
            display: "flex",
            justifyContent: "left",
            alignItems: "top",
          }}
        >
          <span style={{ padding: "5px" }}>
            {type === "config" ? (
              <Tooltip title="Configuration">
                <span>
                  <Tune style={{ opacity: "0.3" }} />
                </span>
              </Tooltip>
            ) : type === "up" ? (
              <Tooltip title="Load Up">
                <span>
                  <KeyboardArrowUp style={{ opacity: "0.3" }} />
                </span>
              </Tooltip>
            ) : type === "down" ? (
              <Tooltip title="Load Down">
                <span>
                  <KeyboardArrowDown style={{ opacity: "0.3" }} />
                </span>
              </Tooltip>
            ) : type === "toggle" ? (
              <Tooltip title="Load Toggle">
                <span>
                  <ToggleOn style={{ opacity: "0.3" }} />
                </span>
              </Tooltip>
            ) : (
              ""
            )}
          </span>
        </div>
      );
    });
  }

  onBreakpointChange = (breakpoint) => {
    this.setState((prevState) => ({
      currentBreakpoint: breakpoint,
      toolbox: {
        ...prevState.toolbox,
        [breakpoint]:
          prevState.toolbox[breakpoint] ||
          prevState.toolbox[prevState.currentBreakpoint] ||
          [],
      },
    }));
  };

  onCompactTypeChange = () => {
    const { compactType: oldCompactType } = this.state;
    const compactType =
      oldCompactType === "horizontal"
        ? "vertical"
        : oldCompactType === "vertical"
        ? null
        : "horizontal";
    this.setState({ compactType });
  };

  onTakeItem = (item) => {
    this.setState((prevState) => ({
      toolbox: {
        ...prevState.toolbox,
        [prevState.currentBreakpoint]: prevState.toolbox[
          prevState.currentBreakpoint
        ].filter(({ i }) => i !== item.i),
      },
      layouts: {
        ...prevState.layouts,
        [prevState.currentBreakpoint]: [
          ...prevState.layouts[prevState.currentBreakpoint],
          item,
        ],
      },
    }));
  };

  onPutItem = (item) => {
    this.setState((prevState) => {
      return {
        toolbox: {
          ...prevState.toolbox,
          [prevState.currentBreakpoint]: [
            ...(prevState.toolbox[prevState.currentBreakpoint] || []),
            item,
          ],
        },
        layouts: {
          ...prevState.layouts,
          [prevState.currentBreakpoint]: prevState.layouts[
            prevState.currentBreakpoint
          ].filter(({ i }) => i !== item.i),
        },
      };
    });
  };

  onLayoutChange = (layout, layouts) => {
    this.props.onLayoutChange(layout, layouts);
    layout.map((i) => {
      if (i.w === 1 && i.h > 1) {
        i.h = 1;
      }
      return i;
    });
    //remove oversized buttons
    layouts.lg = layout?.filter((i) => i.y < 4);

    //fill in holes with size 1 buttons
    const layoutHoles = layouts.lg.reduce(
      (p, c) => {
        if (c.w >= 1) {
          p[c.y][c.x] = 1;
        }
        if (c.w === 2) {
          p[c.y][c.x + 1] = 1;
        }
        if (c.h === 2) {
          p[c.y + 1][c.x] = 1;
          p[c.y + 1][c.x + 1] = 1;
        }
        return p;
      },
      [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ]
    );

    const itemsToAdd = layoutHoles.reduce((p, c, y) => {
      return [
        ...p,
        ...c.reduce((prev, current, x) => {
          if (!current) {
            prev.push({
              x: x,
              y: y,
              w: 1,
              h: 1,
              i: window.crypto.randomUUID(),
              minW: 1,
              maxW: 2,
              minH: 1,
              maxH: 2,
            });
          }
          return prev;
        }, []),
      ];
    }, []);

    this.setState({ layouts }, () => {
      if (itemsToAdd.length > 0) {
        this.setState({ layouts: { lg: [...layouts.lg, ...itemsToAdd] } });
      }
    });
  };

  render() {
    return (
      <div className="calculator-root">
        <div className="lightswitch">
          <div
            style={{
              height: "302px",
              width: "141px",
              background: "#1e1d1d",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <ResponsiveReactGridLayout
              {...this.props}
              layouts={this.state.layouts}
              onLayoutChange={this.onLayoutChange}
              measureBeforeMount={false}
              useCSSTransforms={this.state.mounted}
              compactType={"vertical"}
              preventCollision={false}
              isBounded={false}
              autoSize={false}
              margin={[2, 2]}
              rowHeight={73}
            >
              {this.generateDOM()}
            </ResponsiveReactGridLayout>
          </div>
        </div>
        <div>
          <TextField
            label="Layout (Parameter 170)"
            value={this.state.selectedLayout + 1 || "Unsupported"}
            readOnly={true}
            fullWidth
          />
        </div>
      </div>
    );
  }
}

function generateLayout() {
  return _.map(_.range(0, 8), function (item, i) {
    return {
      x: i % 2,
      y: Math.floor(i / 2),
      w: 1,
      h: 1,
      i: window.crypto.randomUUID(),
      minW: 1,
      maxW: 2,
      minH: 1,
      maxH: 2,
    };
  });
}
