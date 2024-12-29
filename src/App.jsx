import React from "react";
import _ from "lodash";
import ReactGridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  ToggleOn,
  Tune,
} from "@mui/icons-material";
const ResponsiveReactGridLayout = WidthProvider(Responsive);
import Validlayout from "./layouts.json";
import {
  Collapse,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
  Radio,
} from "@mui/material";
import LoadLevelIndicator from "./LoadLevelIndicator.jsx";
import TextStatus from "./TextStatus.jsx";
import { arrayToInt, byteArrayToLong } from "./utils.js";
import { light } from "@mui/material/styles/createPalette.js";

export default class ToolboxLayout extends React.Component {
  static defaultProps = {
    className: "layout",
    rowHeight: 85,
    onLayoutChange: function () {},
    initialLayout: generateLayout(),
  };

  state = {
    compactType: "vertical",
    mounted: false,
    layout: this.props.initialLayout,
    buttonConfig: this.props.initialLayout.map((i) => ({
      i: i.i,
      buttonLightType: 0,
      indicator: 0,
      text: "",
    })),
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  componentDidUpdate(prevProps, prevState) {
    //Determine layout match
    if (prevState.layout !== this.state.layout) {
      const SELECTED_LAYOUT = Validlayout.findIndex((layout) => {
        return (
          layout.length ===
          layout.filter((button) =>
            this.state.layout.find(
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
    return _.map(this.state.layout, (l) => {
      const type =
        this.state.selectedLayout > -1
          ? Validlayout[this.state.selectedLayout].find(
              (i) => i.x === l.x && i.y === l.y && i.w === l.w && l.h === i.h
            )?.type || ""
          : "";

      const BUTTON_CONFIG = this.state.buttonConfig.find((b) => b.i === l.i);

      const selectedButtonStyles =
        l.i === this.state.selectedButton
          ? { boxShadow: "0px 0px 5px 1px #ff0000" }
          : {};

      return (
        <div
          key={l.i}
          style={{
            background: "#acaeae",
            display: "flex",
            justifyContent: "center",
            alignItems: "top",
            userSelect: "none",
            ...selectedButtonStyles,
          }}
        >
          <span style={{ position: "absolute", top: 5, left: 5 }}>
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
          {BUTTON_CONFIG?.buttonLightType === 0 && (
            <TextStatus text={BUTTON_CONFIG.text} />
          )}
          {BUTTON_CONFIG?.buttonLightType === 1 && <LoadLevelIndicator />}
        </div>
      );
    });
  }

  onLayoutChange = (layout) => {
    layout.map((i) => {
      if (i.w === 1 && i.h > 1) {
        i.h = 1;
      }
      return i;
    });
    //remove oversized buttons
    layout = layout?.reduce((p, c) => {
      if (c.y < 4) p.push({ ...c });
      return p;
    }, []);

    //fill in holes with size 1 buttons
    const layoutHoles = layout.reduce(
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

    const newButtonConfig = this.state.buttonConfig.reduce((p, c) => {
      if (layout.find((el) => el.i === c.i)) {
        p.push(c);
      }
      return p;
    }, []);

    //Remove selection if the button is removed
    let selectedButton = this.state.selectedButton;
    if (!layout.find((l) => l.i === this.state.selectedButton)) {
      selectedButton = "";
    }

    this.setState(
      { layout, buttonConfig: newButtonConfig, selectedButton },
      () => {
        if (itemsToAdd.length > 0) {
          const newLayout = [...layout, ...itemsToAdd];
          const newButtonConfig = [
            ...this.state.buttonConfig,
            ...itemsToAdd.map((l) => ({
              i: l.i,
              buttonLightType: 0,
              indicator: 0,
              text: "",
            })),
          ];
          this.setState({ layout: newLayout, buttonConfig: newButtonConfig });
        }
      }
    );
  };

  handleButtonLightTypeChange = (e) => {
    this.setState((lastState) => {
      const buttonIndex = lastState.buttonConfig.findIndex(
        (b) => b.i === this.state.selectedButton
      );
      const buttonConfig = [...lastState.buttonConfig];

      buttonConfig[buttonIndex] = {
        ...buttonConfig[buttonIndex],
        buttonLightType: parseInt(e.target.value),
      };
      return { buttonConfig };
    });
  };

  handleLoadIndicatorChange = (e) => {
    this.setState((lastState) => {
      const buttonIndex = lastState.buttonConfig.findIndex(
        (b) => b.i === this.state.selectedButton
      );
      const buttonConfig = [...lastState.buttonConfig];

      buttonConfig[buttonIndex] = {
        ...buttonConfig[buttonIndex],
        indicator: parseInt(e.target.value),
      };
      return { buttonConfig: buttonConfig };
    });
  };

  setEngravedButtonText = (e) => {
    this.setState((lastState) => {
      const buttonIndex = lastState.buttonConfig.findIndex(
        (b) => b.i === this.state.selectedButton
      );
      const buttonConfig = [...lastState.buttonConfig];

      buttonConfig[buttonIndex] = {
        ...buttonConfig[buttonIndex],
        text: e.target.value,
      };
      return { buttonConfig: buttonConfig };
    });
  };

  get getStatusTextLightLayoutValue() {
    const value = this.state.layout.reduce(
      (p, c) => {
        const position = c.y * 2 + c.x;
        const value =
          this.state.buttonConfig.find((b) => b.i === c.i)?.buttonLightType ||
          0;
        p[position] = value;
        return p;
      },
      [0, 0, 0, 0, 0, 0, 0, 0]
    );

    return arrayToInt(value);
  }

  get getIndicatorLightLayoutValue() {
    const value = this.state.layout.reduce(
      (p, c) => {
        const position = c.x * 2 + c.y;
        const value =
          this.state.buttonConfig.find((b) => b.i === c.i)?.indicator || 0;
        p[position] = value;
        return p;
      },
      [0, 0, 0, 0, 0, 0, 0, 0]
    );

    return arrayToInt(value);
  }

  render() {
    const SELECTED_BUTTON = this.state.layout.find(
      (el) => el.i === this.state.selectedButton
    );
    const SELECTED_BUTTON_META = this.state.buttonConfig.find(
      (el) => el.i === this.state.selectedButton
    );

    return (
      <div className="calculator-root">
        <div>
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
              <ReactGridLayout
                {...this.props}
                layout={this.state.layout}
                onLayoutChange={this.onLayoutChange}
                measureBeforeMount={false}
                useCSSTransforms={this.state.mounted}
                compactType={"vertical"}
                preventCollision={false}
                isBounded={false}
                autoSize={false}
                cols={2}
                width={141}
                margin={[2, 2]}
                rowHeight={73}
                onDragStart={(a, b) => {
                  this.setState({ selectedButton: b.i });
                }}
              >
                {this.generateDOM()}
              </ReactGridLayout>
            </div>
          </div>
        </div>
        <div className="parameterWrapper">
          <TextField
            label="Layout (Parameter 170)"
            value={this.state.selectedLayout + 1 || "Unsupported"}
            readOnly={true}
            fullWidth
          />
          {this.state.selectedButton && (
            <Collapse in={Boolean(this.state.selectedButton)} unmountOnExit>
              <Typography color="textPrimary">
                Button Area {SELECTED_BUTTON?.y * 2 + SELECTED_BUTTON?.x + 1}{" "}
                Configuration
              </Typography>
              <FormControl>
                <FormLabel id="button-type-picker">Button Type</FormLabel>
                <RadioGroup
                  defaultValue="Text"
                  name="button-type-group"
                  row
                  onChange={this.handleButtonLightTypeChange}
                  value={SELECTED_BUTTON_META?.buttonLightType}
                >
                  <FormControlLabel
                    value={0}
                    control={<Radio />}
                    label="Text"
                    style={{ color: "white" }}
                  />
                  <FormControlLabel
                    value={1}
                    control={<Radio />}
                    label="Status"
                    style={{ color: "white" }}
                  />
                </RadioGroup>
              </FormControl>
              <Collapse in={SELECTED_BUTTON_META?.buttonLightType === 0}>
                <TextField
                  label="Engraved Text"
                  value={SELECTED_BUTTON_META?.text}
                  onChange={this.setEngravedButtonText}
                  helperText="This is only for visualization purposes."
                  size="small"
                />
              </Collapse>
              <FormControl>
                <FormLabel id="indicator-type-picker">Load Indicator</FormLabel>
                <RadioGroup
                  aria-labelledby="indicator-type-picker"
                  defaultValue="Text"
                  name="indicator-type-group"
                  row
                  onChange={this.handleLoadIndicatorChange}
                  value={SELECTED_BUTTON_META?.indicator}
                >
                  <FormControlLabel
                    value={0}
                    control={<Radio />}
                    label="Text"
                    style={{ color: "white" }}
                  />
                  <FormControlLabel
                    value={1}
                    control={<Radio />}
                    label="Status"
                    style={{ color: "white" }}
                  />
                </RadioGroup>
              </FormControl>
            </Collapse>
          )}
          <TextField
            label="Status\Text (Parameter 171)"
            value={this.getStatusTextLightLayoutValue}
            readOnly={true}
            fullWidth
          />
          <TextField
            label="Load Indicator Layout (Parameter 173)"
            value={this.getIndicatorLightLayoutValue}
            readOnly={true}
            fullWidth
          />
          <TextField
            label="Load Button Assignment (Parameter 175)"
            value={0}
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
