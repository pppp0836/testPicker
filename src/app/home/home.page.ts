import { Component } from '@angular/core';
import {PickerColumnOption} from '@ionic/core';
import {PickerController} from '@ionic/angular';
import {Data} from '../config/config';
export interface TizuItem {
  tizu_enname: number;
  tizu_name: string;
}

export interface SubjectItem {
  name: string;
  items: TizuItem[];
}

export interface ProjectItem {
  name: string;
  grade: string;
  subject: SubjectItem[];
}

export interface ProjectItems {
  items: ProjectItem[];
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private pickerCtrl: PickerController) {
    this.projectItems = Data;
  }
  private projects: PickerColumnOption[] = [];
  private subjects: PickerColumnOption[] = [];
  private tiZus: PickerColumnOption[] = [];
  private projectItems: ProjectItems;

  public async showSelect() {
    this.projects = [];
    this.subjects = [];
    this.tiZus = [];
    Promise.all(this.projectItems.items.map((data) => {
      this.projects.push({text: data.name, value: data.subject, duration: 0});
    }));

    Promise.all(this.projects[0].value.map((data) => {
      this.subjects.push({text: (data as SubjectItem).name, value: (data as SubjectItem).items, duration: 0});
    }));

    if (this.subjects[0].value.length > 0) {
      Promise.all(this.subjects[0].value.map((data) => {
        this.tiZus.push({text: (data as TizuItem).tizu_name, value: (data as TizuItem).tizu_enname, duration: 0});
      }));
    }
    const picker =  await this.pickerCtrl.create({
      buttons: [{
        text: '取消',
      }, {text: '确定', handler: (opt) => {
          const p = picker.getColumn('project')
              .then(data => {
                const index = data.selectedIndex;
                const grade = this.projectItems.items[index].grade;
                const param = {xmname: opt.project.text,
                  grade,
                  subject: opt.subject.text,
                  tizuName: opt.tizu.text,
                  tizuEnName: opt.tizu.value,
                  fullHostName: window.location.hostname
                };
                console.log(param);
              });
        }}],
      columns: [
        {
          name: 'project',
          selectedIndex: 0,
          options: this.projects
        },
        {
          name: 'subject',
          selectedIndex: 0,
          options: this.subjects
        },
        {
          name: 'tizu',
          selectedIndex: 0,
          options: this.tiZus
        }
      ],
      // mode: 'ios'
    });
    picker.addEventListener('ionPickerColChange', async (event: any) => {
      const data = event.detail;
      if (data.name === 'project') {
        const curIndex = data.selectedIndex;

        this.subjects = [];
        Promise.all((data.options[curIndex] as PickerColumnOption).value.map((item) => {
          this.subjects.push({text: item.name, value: item.items, duration: 0, selected: true, disabled: false});
        }));

        this.tiZus = [];
        if (this.subjects.length > 0) {
          Promise.all(this.subjects.map((item) => {
            this.tiZus.push({text: (item as TizuItem).tizu_name, value: (item as TizuItem).tizu_enname, duration: 0,
              selected: true, disabled: false});
          }));
        }

        const columns = [];
        columns.push({name: 'project', selectedIndex: curIndex, options: this.projects, optionsWidth: '100px'});
        columns.push({name: 'subject', selectedIndex: 0, options: this.subjects, optionsWidth: '100px'});
        columns.push({name: 'tizu', selectedIndex: 0, options: this.tiZus, align: 'right', optionsWidth: '100px'});
        picker.columns = columns;


      } else if (data.name === 'subject') {
        const curIndex = data.selectedIndex;

        this.tiZus = [];
        Promise.all((data.options[curIndex] as PickerColumnOption).value.map((item) => {
          this.tiZus.push({text: (item as TizuItem).tizu_name, value: (item as TizuItem).tizu_enname, duration: 100});
        }));

        let cl = picker.columns;
        cl = cl.slice(0, 2);
        cl.push({name: 'tizu', selectedIndex: 0, options: this.tiZus, prevSelected: 0});
        picker.columns = cl;
      }
    });
    picker.present();
  }
}
