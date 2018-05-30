/*
 * 前台首页
 */
import React, { PureComponent } from 'react';
import PhotoWelcome from '../../components/Photo/PhotoWelcome';
import AlbumListQuery from '../../components/Photo/AlbumListQuery';

export default class Index extends PureComponent {

  render(){
    return(
      <div className="home">
        <PhotoWelcome />
        <AlbumListQuery />
      </div>
    )
  }

}
