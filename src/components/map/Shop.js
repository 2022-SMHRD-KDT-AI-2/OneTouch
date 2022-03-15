import { renderToString } from "react-dom/server";
import AddReview from "./addReview";
import Marker from "./marker";
import Review from "./review";
import { reviewTitle, URL } from "../../utils/data";
import axios from "axios";

const { Tmapv2 } = window;

axios.defaults.withCredentials = true;

export class Shop {
  constructor(map, data) {
    this.map = map;
    this.data = data;
  }

  //마커 생성
  setMarker = () => {
    this.marker = new Tmapv2.Marker({
      position: new Tmapv2.LatLng(this.data.lat, this.data.long),
      iconHTML: renderToString(<Marker data={this.data} key={this.data.id} />),
      map: this.map,
    });
    this.marker.addListener("click", () => {
      // 마커 클릭시 리뷰 인포윈도우 생성 후 보이도록 함
      this.review = new Tmapv2.InfoWindow({
        position: new Tmapv2.LatLng(this.data.lat, this.data.long),
        background: false,
        border: "0px solid white",
        content: renderToString(<Review data={this.data} key={this.data.id} />),
        type: 2,
        align: 15,
        visible: true,
      });
      this.review.setMap(this.map);

      // 닫기 버튼 클릭시 리뷰 윈포윈도우 닫기
      document.getElementById(this.data.id).addEventListener("click", () => {
        this.review.setMap(null);
      });

      // 리뷰작성버튼 클릭 시 리뷰작성 인포윈도우 생성 및 출력
      document
        .getElementById(this.data.id + "addReview")
        .addEventListener("click", () => {
          this.addReview = new Tmapv2.InfoWindow({
            position: new Tmapv2.LatLng(this.data.lat, this.data.long),
            background: false,
            border: "0px solid white",
            content: renderToString(
              <AddReview id={this.data.id} key={this.data.id} />
            ),
            type: 2,
            align: 15,
            visible: true,
          });

          this.review.setMap(null);
          this.addReview.setMap(this.map);

          // 이미지선택버튼 클릭 시
          document
            .getElementById(this.data.id + "selectImage")
            .addEventListener("change", (e) => {
              const reader = new FileReader();
              reader.readAsDataURL(e.target.files[0]);
              reader.onload = () => {
                let img = document.getElementById(this.data.id + "image");
                img.src = reader.result;
              };
            });

          // 한줄평
          for (let i = 0; i < 10; i += 1) {
            let comment = document.getElementById(
              this.data.id + "addReview_comment" + i
            );
            comment.addEventListener("click", (e) => {
              e.target.value = !e.target.value;
              if (e.target.value) {
                comment.style.border = "1px solid #007cb9";
                comment.style.backgroundColor = "007cb9";
                comment.style.borderRadius = "20px";
              } else {
                comment.style.border = "1px solid white";
                comment.style.color = "black";
              }
            });
          }

          // 리뷰 제출버튼
          document
            .getElementById(this.data.id + "submitReview")
            .addEventListener("click", () => {
              const score = [];
              const comment = [];
              reviewTitle.forEach((item, index) => {
                score.push(document.getElementById(this.data.id + item).value);
              });
              for (let i = 0; i < 10; i++) {
                if (
                  document.getElementById(
                    this.data.id + "addReview_comment" + i
                  ).value
                ) {
                  comment.push(i);
                }
              }
              const formData = new FormData();
              formData.append(
                "img",
                document.getElementById(`${this.data.id}selectImage`).files[0]
              );
              formData.append("shopId", this.data.id);
              formData.append("comment", comment.join(","));
              formData.append("tasty", score[0]);
              formData.append("price", score[1]);
              formData.append("cleanliness", score[2]);
              formData.append("acessibility", score[3]);
              formData.append("mood", score[4]);
              console.log(formData);

              axios.post(URL + "/reviews", formData).then((res) => {
                this.addReview.setMap(null);
              });
            });

          document
            .getElementById(this.data.id + "closeAddReview")
            .addEventListener("click", () => {
              this.review.setMap(this.map);
              this.addReview.setMap(null);
            });
        });
    });
  };

  setAddReview = () => {};
}
