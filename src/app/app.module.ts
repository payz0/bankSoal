import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';
import { QuillModule } from 'ngx-quill';
import { FilterPipeModule } from 'ngx-filter-pipe';
import {NgxImageCompressService} from 'ngx-image-compress';
import {DragDropModule} from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SoalComponent } from './bank/soal/soal.component';
import { DataService } from './bank/data.service';
import { TestComponent } from './bank/test/test.component';
import { ProfilComponent } from './bank/profil/profil.component';
import { SiswaComponent } from './bank/siswa/siswa.component';
import { ListSoalComponent } from './bank/list-soal/list-soal.component';
import { FolderComponent } from './bank/folder/folder.component';
import { RencanaComponent } from './bank/rencana/rencana.component';
import { KelasComponent } from './bank/kelas/kelas.component';
import { HomeComponent } from './bank/home/home.component';
import { ForumComponent } from './bank/forum/forum.component';
import { SuComponent } from './bank/su/su.component';

@NgModule({
  declarations: [
    AppComponent,
    SoalComponent,
    TestComponent,
    ProfilComponent,
    SiswaComponent,
    ListSoalComponent,
    FolderComponent,
    RencanaComponent,
    KelasComponent,
    HomeComponent,
    ForumComponent,
    SuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, 
    FormsModule,
    FilterPipeModule,
    DragDropModule,
    QuillModule.forRoot()
  ],
  providers: [DataService,NgxImageCompressService],
  bootstrap: [AppComponent]
})
export class AppModule { }
