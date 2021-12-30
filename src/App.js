import { IoArrowDownSharp, IoArrowUpSharp, IoPlaySharp, IoPauseSharp, IoReloadSharp } from 'react-icons/io5';
import { Component } from 'react';

const accurateInterval = function(fn, time) {
  var cancel, nextAt, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function () {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel
  };
};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      brkLength: 5,
      seshLength: 25,
      timerState: 'stopped',
      timerType: 'Session',
      timer: 1500,
      intervalID: '',
      alarmColor: { color: 'white' }
    };
    this.setBrkLength = this.setBrkLength.bind(this);
    this.setSeshLength = this.setSeshLength.bind(this);
    this.lengthControl = this.lengthControl.bind(this);
    this.timerControl = this.timerControl.bind(this);
    this.beginCountDown = this.beginCountDown.bind(this);
    this.decrementTimer = this.decrementTimer.bind(this);
    this.phaseControl = this.phaseControl.bind(this);
    this.warning = this.warning.bind(this);
    this.buzzer = this.buzzer.bind(this);
    this.switchTimer = this.switchTimer.bind(this);
    this.clockify = this.clockify.bind(this);
    this.reset = this.reset.bind(this);
  }

  setBrkLength(e) {
    this.lengthControl(
      'brkLength',
      e.currentTarget.value,
      this.state.brkLength,
      'Session'
    );
  }

  setSeshLength(e) {
    this.lengthControl(
      'seshLength',
      e.currentTarget.value,
      this.state.seshLength,
      'Break'
    );
  }

  lengthControl(stateToChange, sign, currentLength, timerType) {
    if (this.state.timerState === 'running') {
      return;
    }
    if (this.state.timerType === timerType) {
      if (sign === '-' && currentLength !== 1) {
        this.setState({ [stateToChange]: currentLength - 1 });
      } else if (sign === '+' && currentLength !== 60) {
        this.setState({ [stateToChange]: currentLength + 1 });
      }
    } else if (sign === '-' && currentLength !== 1) {
      this.setState({
        [stateToChange]: currentLength - 1,
        timer: currentLength * 60 - 60
      });
    } else if (sign === '+' && currentLength !== 60) {
      this.setState({
        [stateToChange]: currentLength + 1,
        timer: currentLength * 60 + 60
      });
    }
  }

  timerControl() {
    if (this.state.timerState === 'stopped') {
      this.beginCountDown();
      this.setState({ timerState: 'running' });
    } else {
      this.setState({ timerState: 'stopped' });
      if (this.state.intervalID) {
        this.state.intervalID.cancel();
      }
    }
  }

  beginCountDown() {
    this.setState({
      intervalID: accurateInterval(() => {
        this.decrementTimer();
        this.phaseControl();
      }, 1000)
    });
  }

  decrementTimer() {
    this.setState({ timer: this.state.timer - 1 });
  }

  phaseControl() {
    let timer = this.state.timer;
    this.warning(timer);
    this.buzzer(timer);
    if (timer < 0) {
      if (this.state.intervalID) {
        this.state.intervalID.cancel();
      }
      if (this.state.timerType === 'Session') {
        this.beginCountDown();
        this.switchTimer(this.state.brkLength * 60, 'Break');
      } else {
        this.beginCountDown();
        this.switchTimer(this.state.seshLength * 60, 'Session');
      }
    }
  }

  warning(_timer) {
    if (_timer < 61) {
      this.setState({ alarmColor: { color: '#a50d0d' } });
    } else {
      this.setState({ alarmColor: { color: 'white' } });
    }
  }

  buzzer(_timer) {
    if (_timer === 0) {
      this.audioBeep.play();
    }
  }

  switchTimer(num, str) {
    this.setState({
      timer: num,
      timerType: str,
      alarmColor: { color: 'white' }
    });
  }

  clockify() {
    let minutes = Math.floor(this.state.timer / 60);
    let seconds = this.state.timer - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return minutes + ':' + seconds;
  }

  reset() {
    this.setState({
      brkLength: 5,
      seshLength: 25,
      timerState: 'stopped',
      timerType: 'Session',
      timer: 1500,
      intervalID: '',
      alarmColor: { color: 'white' }
    });
    if (this.state.intervalID) {
      this.state.intervalID.cancel();
    }
    this.audioBeep.pause();
    this.audioBeep.currentTime = 0;
  }

  render() {
    return (
      <div className="app container-fluid text-center">

        <h1 className="title">25 + 5 Clock</h1>

        <div className="d-flex align-items-center">

          <div id="break-label" className="mx-auto">
            <p className="label mb-0">Break Length</p>
            <div className="d-flex justify-content-center align-items-center">
              <button type="button" id="break-decrement" className="p-0 border-0 bg-transparent" value="-" onClick={this.setBrkLength}>
                <IoArrowDownSharp />
              </button>
              <p id="break-length" className="length fw-bold mb-0 mx-2">{this.state.brkLength}</p>
              <button type="button" id="break-increment" className="bg-transparent border-0 p-0" value="+" onClick={this.setBrkLength}>
                <IoArrowUpSharp />
              </button>
            </div>
          </div>

          <div id="session-label" className="mx-auto ms-5">
            <p className="label mb-0">Session Length</p>
            <div className="d-flex justify-content-center align-items-center">
              <button type="button" id="session-decrement" className="p-0 border-0 bg-transparent" value="-" onClick={this.setSeshLength}><IoArrowDownSharp /></button>
              <p id="session-length" className="length fw-bold mb-0 mx-2">{this.state.seshLength}</p>
              <button type="button" id="session-increment" className="p-0 border-0 bg-transparent" value="+" onClick={this.setSeshLength}><IoArrowUpSharp /></button>
            </div>
          </div>

        </div>

        <div id="timer" className="mx-auto" style={this.state.alarmColor}>
          <div id="timer-label" className="mb-0">{this.state.timerType}</div>
          <div id="time-left">{this.clockify()}</div>
        </div>

        <div className="d-flex justify-content-center align-items-center mt-2">
          <button type="button" id="start_stop" className="bg-transparent text-white border-0 p-0" onClick={this.timerControl}>
            <IoPlaySharp />
            <IoPauseSharp style={{ marginLeft: '-15px' }} />
          </button>
          <button type="button" id="reset" className="bg-transparent text-white border-0 p-0 ms-2" onClick={this.reset}>
            <IoReloadSharp />
          </button>
        </div>

        <audio
          id="beep"
          preload="auto"
          ref={(audio) => {
            this.audioBeep = audio;
          }}
          src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
        />

      </div>
    );
  }

}

export default App;
