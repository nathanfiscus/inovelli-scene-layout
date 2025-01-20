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
import ValidLayouts from "./layouts.json";
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
  InputLabel,
  Select,
  MenuItem,
  Paper,
  AppBar,
  Toolbar,
} from "@mui/material";
import LoadLevelIndicator from "./LoadLevelIndicator.jsx";
import TextStatus from "./TextStatus.jsx";
import { arrayToInt } from "./utils.js";
import logo from "./assets/inovelli.svg";

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
      type: "none",
      text: "",
      ledConfig: [
        {
          type: 0,
          loadIndicator: 0,
        },
      ],
    })),
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  componentDidUpdate(prevProps, prevState) {
    //Determine layout match
    if (prevState.layout !== this.state.layout) {
      const SELECTED_LAYOUT = ValidLayouts.findIndex((layout) => {
        return (
          layout.length > 0 &&
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
      const BUTTON_CONFIG = this.state.buttonConfig.find((b) => b.i === l.i);

      const LED_CONFIG_PRIMARY = BUTTON_CONFIG.ledConfig[0];
      const LED_CONFIG_SECONDARY = BUTTON_CONFIG.ledConfig[1] || {};

      const selectedButtonStyles =
        l.i === this.state.selectedButton
          ? { boxShadow: "0px 0px 5px 1px #ff0000" }
          : {};

      const type =
        this.state.selectedLayout > -1
          ? ValidLayouts[this.state.selectedLayout].find(
              (i) => i.x === l.x && i.y === l.y && i.w === l.w && l.h === i.h
            )?.type || ""
          : "";

      const right = l.w === 1 ? l.x === 1 : true;

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
          <span
            style={{
              position: "absolute",
              top: 5,
              left: right ? 5 : undefined,
              right: right ? undefined : 5,
            }}
          >
            {type === "config" ? (
              <Tooltip title="Configuration Button">
                <span>
                  <Tune style={{ opacity: "0.3", fontSize: "16px" }} />
                </span>
              </Tooltip>
            ) : type === "up" ? (
              <Tooltip title="Config Up">
                <span>
                  <KeyboardArrowUp
                    style={{ opacity: "0.3", fontSize: "16px" }}
                  />
                </span>
              </Tooltip>
            ) : type === "down" ? (
              <Tooltip title="Config Down">
                <span>
                  <KeyboardArrowDown
                    style={{ opacity: "0.3", fontSize: "16px" }}
                  />
                </span>
              </Tooltip>
            ) : type === "toggle" ? (
              <Tooltip title="Load Toggle">
                <span>
                  <ToggleOn style={{ opacity: "0.3", fontSize: "16px" }} />
                </span>
              </Tooltip>
            ) : (
              ""
            )}
          </span>
          {LED_CONFIG_PRIMARY?.type === 0 && (
            <TextStatus text={BUTTON_CONFIG.text} />
          )}
          {(l.w !== 2 ? LED_CONFIG_PRIMARY : LED_CONFIG_SECONDARY)?.type ===
            1 && <LoadLevelIndicator right={right} />}
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
      const BUTTON = layout.find((el) => el.i === c.i);
      if (BUTTON) {
        if (BUTTON.w === 2 && c.ledConfig.length === 1) {
          const newLEDConfig = {};
          newLEDConfig.type = c.ledConfig[0].type;
          newLEDConfig.loadIndicator = c.ledConfig[0].loadIndicator;
          if (newLEDConfig.type === 1) {
            c.ledConfig[0].type = 0;
          }
          c.ledConfig.push(newLEDConfig);
        }
        //Merge configs to one
        if (BUTTON.w === 1 && c.ledConfig.length === 2) {
          const newLEDConfig = {
            type: BUTTON.text ? c.ledConfig[1].type : c.ledConfig[0].type,
            loadIndicator:
              c.ledConfig[0].loadIndicator || c.ledConfig[1].loadIndicator
                ? 1
                : 0,
          };
          c.ledConfig = [newLEDConfig];
        }
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
              type: "none",
              text: "",
              ledConfig: [
                {
                  type: 0,
                  loadIndicator: 0,
                },
              ],
            })),
          ];
          this.setState({ layout: newLayout, buttonConfig: newButtonConfig });
        }
      }
    );
  };

  handleLoadActionChange = (e) => {
    this.setState((lastState) => {
      const buttonIndex = lastState.buttonConfig.findIndex(
        (b) => b.i === this.state.selectedButton
      );
      const buttonConfig = [...lastState.buttonConfig];

      buttonConfig[buttonIndex] = {
        ...buttonConfig[buttonIndex],
        type: e.target.value,
      };
      return { buttonConfig: buttonConfig };
    });
  };

  handleButtonLightTypeChange = (i) => (e) => {
    this.setState((lastState) => {
      const buttonIndex = lastState.buttonConfig.findIndex(
        (b) => b.i === this.state.selectedButton
      );
      const buttonConfig = [...lastState.buttonConfig];

      buttonConfig[buttonIndex].ledConfig[i] = {
        ...buttonConfig[buttonIndex].ledConfig[i],
        type: parseInt(e.target.value),
      };
      return { buttonConfig };
    });
  };

  handleLoadIndicatorChange = (i) => (e) => {
    this.setState((lastState) => {
      const buttonIndex = lastState.buttonConfig.findIndex(
        (b) => b.i === this.state.selectedButton
      );
      const buttonConfig = [...lastState.buttonConfig];

      buttonConfig[buttonIndex].ledConfig[i] = {
        ...buttonConfig[buttonIndex].ledConfig[i],
        loadIndicator: parseInt(e.target.value),
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
        const position = c.x * 2 + c.y;
        const BUTTON_CONFIG = this.state.buttonConfig.find((b) => b.i === c.i);

        p[position] = BUTTON_CONFIG.ledConfig[0].type;
        if (BUTTON_CONFIG.ledConfig.length === 2) {
          p[position + 1] = BUTTON_CONFIG.ledConfig[1].type;
        }
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
        const BUTTON_CONFIG = this.state.buttonConfig.find((b) => b.i === c.i);

        p[position] = BUTTON_CONFIG.ledConfig[0].loadIndicator;
        if (BUTTON_CONFIG.ledConfig.length === 2) {
          p[position + 1] = BUTTON_CONFIG.ledConfig[1].loadIndicator;
        }
        return p;
      },
      [0, 0, 0, 0, 0, 0, 0, 0]
    );

    return arrayToInt(value);
  }

  get getLoadControlValue() {
    const value = this.state.layout.reduce((p, c) => {
      const position = c.x * 2 + c.y;
      const BUTTON_CONFIG = this.state.buttonConfig.find((b) => b.i === c.i);

      let multiplier = 0;
      switch (BUTTON_CONFIG.type) {
        case "toggle":
          multiplier = 256;
          break;
        case "down":
          multiplier = 16;
          break;
        case "up":
          multiplier = 1;
          break;
        default:
          multiplier = 0;
          break;
      }

      return p + position * multiplier;
    }, 0);

    return value;
  }

  render() {
    const SELECTED_BUTTON = this.state.layout.find(
      (el) => el.i === this.state.selectedButton
    );
    const UP_LOAD_BUTTON = this.state.buttonConfig.find(
      (el) => el.type === "up"
    );
    const DOWN_LOAD_BUTTON = this.state.buttonConfig.find(
      (el) => el.type === "down"
    );
    const TOGGLE_LOAD_BUTTON = this.state.buttonConfig.find(
      (el) => el.type === "toggle"
    );
    const SELECTED_BUTTON_META = this.state.buttonConfig.find(
      (el) => el.i === this.state.selectedButton
    );

    let LED_ARRAY = new Array(SELECTED_BUTTON?.w || 1);
    LED_ARRAY.fill(1);
    LED_ARRAY = LED_ARRAY.map(
      (i, index) => SELECTED_BUTTON?.y * 2 + SELECTED_BUTTON?.x + index + 1
    );

    return (
      <div id="root">
        <AppBar style={{ background: "black" }}>
          <Toolbar style={{ alignItems: "center", justifyContent: "center" }}>
            <img src={logo} style={{ height: 32 }} />
            <Typography>
              <span style={{ fontSize: 32, letterSpacing: -8 }}> ::</span>
            </Typography>
            <Typography style={{ marginLeft: 10, marginTop: 7, fontSize: 20 }}>
              Scene Layout Calculator
            </Typography>
          </Toolbar>
        </AppBar>

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
          <Paper elevation={2} className="areaConfigurationWrapper">
            {!this.state.selectedButton && (
              <div
                style={{
                  height: 400,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Select a button to configure
                </Typography>
              </div>
            )}
            {this.state.selectedButton && (
              <Collapse in={Boolean(this.state.selectedButton)} unmountOnExit>
                <Typography
                  color="textPrimary"
                  gutterBottom
                  style={{ marginBottom: 16, textAlign: "center" }}
                >
                  Button Area {SELECTED_BUTTON?.y * 2 + SELECTED_BUTTON?.x + 1}{" "}
                  Configuration
                </Typography>
                <FormControl fullWidth size="sm" style={{ marginBottom: 16 }}>
                  <InputLabel id="loadActionLabel">Load Action</InputLabel>
                  <Select
                    labelId="loadActionLabel"
                    id="loadAction"
                    value={SELECTED_BUTTON_META.type || "none"}
                    label="Button Load Action"
                    onChange={this.handleLoadActionChange}
                    size="sm"
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem
                      value="up"
                      disabled={
                        UP_LOAD_BUTTON && SELECTED_BUTTON.i !== UP_LOAD_BUTTON.i
                      }
                    >
                      Up
                    </MenuItem>
                    <MenuItem
                      value="down"
                      disabled={
                        DOWN_LOAD_BUTTON &&
                        SELECTED_BUTTON.i !== DOWN_LOAD_BUTTON.i
                      }
                    >
                      Down
                    </MenuItem>
                    <MenuItem
                      value="toggle"
                      disabled={
                        TOGGLE_LOAD_BUTTON &&
                        SELECTED_BUTTON.i !== TOGGLE_LOAD_BUTTON.i
                      }
                    >
                      Toggle
                    </MenuItem>
                  </Select>
                </FormControl>
                <Collapse in={SELECTED_BUTTON_META?.ledConfig[0].type === 0}>
                  <TextField
                    label="Engraved Text"
                    value={SELECTED_BUTTON_META?.text}
                    onChange={this.setEngravedButtonText}
                    helperText="This is only for visualization purposes."
                    size="small"
                    fullWidth
                  />
                </Collapse>
                {LED_ARRAY.map((i, index, a) => (
                  <div key={i}>
                    <Typography
                      variant="body1"
                      style={{
                        marginTop: 24,
                        textAlign: "center",
                        marginBottom: 8,
                      }}
                    >
                      {a.length > 1 ? (index == 0 ? "Left" : "Right") : ""} LED
                      Configuration
                    </Typography>
                    <div>
                      <FormControl fullWidth>
                        <FormLabel
                          id="button-type-picker"
                          component={Typography}
                          variant="caption"
                        >
                          LED Type
                        </FormLabel>
                        <RadioGroup
                          defaultValue="Text"
                          name="button-type-group"
                          row
                          onChange={this.handleButtonLightTypeChange(index)}
                          value={SELECTED_BUTTON_META.ledConfig[index].type}
                        >
                          <FormControlLabel
                            value={0}
                            control={<Radio />}
                            label={index !== 0 ? "None" : "Text"}
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
                    </div>
                    <div>
                      <FormControl>
                        <FormLabel id="indicator-type-picker">
                          Indicate Load Status
                        </FormLabel>
                        <RadioGroup
                          aria-labelledby="indicator-type-picker"
                          defaultValue="Text"
                          name="indicator-type-group"
                          row
                          onChange={this.handleLoadIndicatorChange(index)}
                          value={
                            SELECTED_BUTTON_META.ledConfig[index]?.loadIndicator
                          }
                        >
                          <FormControlLabel
                            value={0}
                            control={<Radio />}
                            label="No"
                            style={{ color: "white" }}
                          />
                          <FormControlLabel
                            value={1}
                            control={<Radio />}
                            label="Yes"
                            style={{ color: "white" }}
                          />
                        </RadioGroup>
                      </FormControl>
                    </div>
                  </div>
                ))}
              </Collapse>
            )}
          </Paper>
        </div>
        <div className="parameterWrapper">
          <TextField
            label="Layout (Parameter 170)"
            value={this.state.selectedLayout + 1 || "Unsupported"}
            readOnly={true}
            fullWidth
          />
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
            value={this.getLoadControlValue}
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
