import React from 'react';
import './Track.css';



class Track extends React.Component {
  constructor(props) {
    super(props);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.renderAction = this.renderAction.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
  }




  addTrack () {
    this.props.onAdd(this.props.track);
  }

  removeTrack () {
    this.props.onRemove(this.props.track);
  }

  renderAction(isRemoval) {
    if(isRemoval) {
      return <a className="Track-action" onClick={this.removeTrack}>-</a>;
    } else {
      return <a className="Track-action" onClick={this.addTrack}>+</a>;
    }
  }

  handlePreview() {
    if(this.props.track.preview) {
      return (
        <audio controls className="audio-player"><source src={this.props.track.preview} /></audio>
      )
    }
  }


  render () {
    return (
      <div className="Track">
        <div className="Track-information">
          <h3>{this.props.track.name}</h3>
          <p>{this.props.track.artist} | {this.props.track.album}</p>
          <div>{this.handlePreview()}</div>
        </div>
        {this.renderAction(this.props.isRemoval)}
      </div>
    );
  }
};

export default Track;
