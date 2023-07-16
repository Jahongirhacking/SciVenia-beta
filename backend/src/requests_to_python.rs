use std::collections::HashMap;

use urlencoding::{encode};
use std::fs::{write, File};
use std::io::Read;
use std::time::SystemTime;

use crate::graph::ScientistProfile;

use rocket::serde::json::Value;
use serde::{Serialize, Deserialize};


const API_URL : &str = "http://37.77.104.19:3000";
#[derive(Default, Serialize, Deserialize)]
struct Publication {
  author_ids: Vec<String>,
  pub_year: u64,
  // num_citations: u64,
}

async fn write_publication_to_file(title: &str) -> Option<Publication> {
  let publication = get_publication_from_python(title).await;

  match &publication {
    Some(paper) => {
      let content = serde_json::to_string(&paper).unwrap();
      write(String::from("./DB/publications/") + title, content)
    },
    None => write(String::from("./DB/publications/") + title, serde_json::to_string(&Value::Null).unwrap())
  }.expect("cannot write publication to file");
  
  publication
}

async fn get_publication(title: &str) -> Option<Publication> {
  
  let file = File::open(String::from("./DB/publications/") + title);
  match file {
    Ok(mut exist) => {
      if SystemTime::now().duration_since(
                  exist.metadata().expect("no metadata").modified().expect("cannot get modified time"))
              .expect("clock have gone backwards").as_secs() <= 200000 {
        
        println!("read from existing publication file : {}", title);
        let mut data = String::new();
        exist.read_to_string(&mut data).unwrap();
        println!("got json from existing publication file : {}", title);
        let publication : Publication = serde_json :: from_str(data.as_str()).unwrap_or_default();
        println!("parsed json from existing publication file : {}", title);
        Some(publication)
      } else {
        println!("rewriting existing publication file : {}", title);
        write_publication_to_file(title).await
      }
      
    }
    Err(_) => {
      println!("creating publication file : {}", title);
      write_publication_to_file(title).await
    }
  }
  
}



fn response_to_publication(response: &Value) -> Publication {
  let mut publication : Publication = Default::default();
  publication.author_ids = response.get("author_id").unwrap_or(&Value::Array(vec![])).as_array().unwrap()
                              .iter().map(|id| String::from(id.as_str().unwrap()))
                                            .collect();
  publication.pub_year = response.get("bib").unwrap_or(&Value::Null).get("pub_year")
                                .unwrap_or(&Value::Number(10000.into())).as_u64().unwrap_or(10000);

  // publication.num_citations = response.get("num_citations").unwrap().as_u64().unwrap();
  publication
}

  


async fn get_publication_from_python(title: &str) -> Option<Publication> {
  let url = API_URL.to_string() + "publication/" + title;
  let request = reqwest::get(url).await;
  match request {
    Ok(ans) => {
      let publication : Value = serde_json :: from_str(&*ans.text().await.unwrap()).expect("thms went wrong");
      
      Some(response_to_publication(&publication))
    }
    Err(_) => return None
  }
}

async fn write_coauthors_to_file(id: &str) -> Option<HashMap<String, HashMap<String, u64>>> {
  let coauthors = get_coauthors_by_id_from_python(id).await;
  // let _ = File::create(String::from("./DB/coauthors/") + id).unwrap();
  match &coauthors {
    Some(paper) => {
      let content = serde_json::to_string(&paper).unwrap();
      write(String::from("./DB/coauthors/") + id, content)
    },
    None => write(String::from("./DB/coauthors/") + id, serde_json::to_string(&Value::Null).unwrap())
  }.expect("cannot write coauthors to file");
  
  coauthors
}

pub async fn get_coauthors_by_id(id: &str) -> Option<HashMap<String, HashMap<String, u64>>> { 
  let file = File::open(String::from("./DB/coauthors/") + id);
  match file {
    Ok(mut exist) => {
      if SystemTime::now().duration_since(
                  exist.metadata().expect("no metadata").modified().expect("cannot get modified time"))
              .expect("clock have gone backwards").as_secs() <= 200000 {
        
        println!("read from existing coauthor file: {}", id);
        let mut data = String::new();
        exist.read_to_string(&mut data).unwrap();
        
        let coauthors :HashMap<String, HashMap<String, u64>>  = serde_json::from_str(data.as_str())
                                                                    .unwrap_or_default();
        
        return Some(coauthors);
      } else {
        println!("rewritnig existing couthor file: {}", id);
        write_coauthors_to_file(id).await
      }
      
    }
    Err(_) => {
      println!("creating coauthor file: {}", id);
      write_coauthors_to_file(id).await
    }
  }
}

async fn get_coauthors_by_id_from_python(id: &str) -> Option<HashMap<String, HashMap<String, u64>>> {
  let url = API_URL.to_string() + "id/coauthors/" + id;
  let author = reqwest::get(url).await;
  match author {
    Ok(ans) => {
      let author : Value = serde_json :: from_str(&*ans.text().await.unwrap()).expect("thms went wrong");
      let publications = author.get("publications").unwrap().as_array().unwrap();
      let mut authors_extra = HashMap::new();
      let mut default_author = HashMap::new();
      default_author.insert("year".to_string(), 10000);
      default_author.insert("number_pub".to_string(), 0);
      

      for publication_value in publications {
          let publication = get_publication(encode(publication_value.get("bib").unwrap()
                                                                                        .get("title").unwrap().as_str().unwrap())
                                                                                        .into_owned().as_str())
                                                                                        .await;
          match publication {
            Some(article) =>{
              let year = article.pub_year;
              for author_id in article.author_ids {
                let author_prev_data = authors_extra.get(&author_id).unwrap_or(&default_author);
                let mut temp = HashMap::new();
                temp.insert("year".to_string(), std::cmp::min(year, author_prev_data["year"]));
                temp.insert("number_pub".to_string(), author_prev_data["number_pub"] + 1);
                // temp.insert()
                authors_extra.insert(author_id, temp);
              }
            }
            None => {}
          }
      }
      return Some(authors_extra);
      // let mut result = vec![];
      // for coauthor in author.get("coauthors").unwrap().as_array().unwrap() {
        
      //   result.push(authors_extra[coauthor.get("name").unwrap()
      //                                     .get("scholar_id").unwrap().as_str().unwrap()].clone());
      // }

      // Some(result)
    }

    Err(_) => {
      None
    }
  }
}

async fn write_author_to_file(id: &str) -> Option<ScientistProfile> {
  let author = get_author_info_from_python(id).await;

  match &author {
    Some(paper) => {
      let content = serde_json::to_string(&paper).unwrap();
      write(String::from("./DB/authors/") + id, content)
    },
    None => write(String::from("./DB/authors/") + id, serde_json::to_string(&Value::Null).unwrap())
  }.expect("cannot write author to file");
  
  author
}

pub async fn get_author_info(id: &str) -> Option<ScientistProfile> { 
  if id == "" {
    return None;
  }
  let file = File::open(String::from("./DB/authors/") + id);
  match file {
    Ok(mut exist) => {
      if SystemTime::now().duration_since(
                  exist.metadata().expect("no metadata").modified().expect("cannot get modified time"))
              .expect("clock have gone backwards").as_secs() <= 200000 {
        
        println!("read from existing author file: {}", id);
        let mut data = String::new();
        exist.read_to_string(&mut data).unwrap();
        let author: ScientistProfile   = serde_json :: from_str(data.as_str()).expect("thms went wrong");

        Some(author.clone())
      } else {
        println!("rewritnig existing author file: {}", id);
        write_author_to_file(id).await
      }
      
    }
    Err(_) => {
      println!("creating author file: {}", id);
      write_author_to_file(id).await
    }
  }
}


async fn get_author_info_from_python(id: &str) -> Option<ScientistProfile> {
  let url = API_URL.to_string() + "id/author_info/" + id;
  let request = reqwest::get(url).await;
  match request {
    Ok(ans) => {
      let json : Value = serde_json :: from_str(&*ans.text().await.unwrap()).expect("thms went wrong");
      let scientist = ScientistProfile {
        affiliation : json.get("affiliation").unwrap_or(&Value::String("".to_string()))
                          .as_str().unwrap().to_string(),
        citedby : json.get("citedby").unwrap_or(&Value::Number(0.into()))
                      .as_u64().unwrap() as usize,
        citedby5y : json.get("citedby5y").unwrap_or(&Value::Number(0.into()))
                        .as_u64().unwrap() as usize,
        email_domain : json.get("email_domain").unwrap_or(&Value::String("".to_string()))
                           .as_str().unwrap().to_string(),
        hindex : json.get("hindex").unwrap_or(&Value::Number(0.into()))
                      .as_u64().unwrap() as usize,
        hindex5y : json.get("hindex5y").unwrap_or(&Value::Number(0.into()))
                        .as_u64().unwrap() as usize,
        homepage: json.get("homepage").unwrap_or(&Value::String("".to_string()))
                      .as_str().unwrap().to_string(),
        i10index : json.get("i10index").unwrap_or(&Value::Number(0.into()))
                        .as_u64().unwrap() as usize,
        i10index5y: json.get("i10index5y").unwrap_or(&Value::Number(0.into()))
                        .as_u64().unwrap() as usize,
        interests : json.get("interests").unwrap_or(&Value::Array(vec![])).as_array().unwrap().iter()
                        .map(|x| x.as_str().unwrap().to_string()).collect(),
        name : json.get("name").unwrap_or(&Value::String("".to_string()))
                    .as_str().unwrap().to_string(),
        organization : json.get("organization").unwrap_or(&Value::Number(0.into()))
                          .as_i64().unwrap_or(0),
        scholar_id : json.get("scholar_id").unwrap_or(&Value::String("".to_string()))
                         .as_str().unwrap().to_string(),
        url_picture : json.get("url_picture").unwrap_or(&Value::String("".to_string()))
                           .as_str().unwrap().to_string(),
        coauthors : json.get("coauthors").unwrap_or(&Value::Array(vec![])).as_array().unwrap().iter()
                        .map(|x| x.get("scholar_id").unwrap().as_str().unwrap().to_string()).collect()
      };

      Some(scientist)
    }

    Err(_) => {
      None
    }
  }
}